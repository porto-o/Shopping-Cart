// simulate getting products from DataBase
const products = [
  { name: "Apples:", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans:", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  const addToCart = (e) => {
    e.preventDefault(); // Prevent the default form submission

    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    if (item[0].instock <= 0) return;
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
    let auxItems = items.map((item) => {
      if (item.name == name) item.instock--;
      return item;
    });
    setItems(auxItems);
  };
  const deleteCartItem = (index) => {
    const itemRemoved = cart[index];
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
    let newItems = [...items];
    newItems = items.map((item) => {
      if (item.name == itemRemoved.name) item.instock++;
      return item;
    });
    setItems(newItems);
  };
  const photos = (index) =>
    `https://picsum.photos/id/${
      index + Math.floor(Math.random() * 100)
    }/200/200`;

  let list = items.map((item, index) => {
    return (
      <li key={index}>
        {/* <Image src={photos[index % 4]} width={70} roundedCircle></Image> */}
        <Image src={photos(index)} width={70} roundedCircle></Image>
        <div variant="primary" size="large">
          {item.name}: ${item.cost}
        </div>
        <div variant="primary" size="large">
          Stock = {item.instock}
        </div>
        <Button name={item.name} onClick={addToCart}>Add to cart</Button>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <div key={index}>
        <h4>{item.name}</h4>
        <button onClick={() => deleteCartItem(index)}>Remove</button>
      </div>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  const restockProducts = (url) => {
    fetch(url)
      .then((res) => res.json())
      .then((list) => {
        let updatedList = list.data.map(({ attributes }) => {
          const { name, country, cost, instock } = attributes;
          return { name, country, cost, instock };
        });
        setItems(updatedList);
      });
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Products</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(query);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <button type="submit">Restock</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
