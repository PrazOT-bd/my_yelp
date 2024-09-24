import React, { useState, useEffect } from 'react';
import { listRestaurants } from "./graphql/queries";
import { createRestaurant, deleteRestaurant } from "./graphql/mutations";
import "@aws-amplify/ui-react/styles.css";
import './App.css';
import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports';
import { generateClient } from 'aws-amplify/api';
import { withAuthenticator, View, Heading, Button } from '@aws-amplify/ui-react';
import yelpLogo from './yelp.png';

Amplify.configure(awsmobile);
const client = generateClient();


// Header Component
const Header = () => (
  <header className="app-header">
    <img src={yelpLogo} alt="Yelp Logo" className="yelp-logo" />
    <Heading className="app-title">
      <h1>Welcome to my Yelp App!!</h1>
    </Heading>
    <p className="app-description">
                                   
    </p>
  </header>
);

// Restaurant Form Component
const RestaurantForm = ({ input, setInput, createARestaurant }) => (
  <section className="add-restaurant-section">
    <Heading level={4} className="section-heading">
      Add a Restaurant
    </Heading>
    <View as="form" className="restaurant-form" onSubmit={createARestaurant}>
      <input
        placeholder="Restaurant Name"
        value={input.name}
        onChange={(e) => setInput({ ...input, name: e.target.value })}
        className="input-field"
        required
      />
      <input
        placeholder="Description"
        value={input.description}
        onChange={(e) => setInput({ ...input, description: e.target.value })}
        className="input-field"
        required
      />
      <input
        placeholder="Restaurant City"
        value={input.city}
        onChange={(e) => setInput({ ...input, city: e.target.value })}
        className="input-field"
        required
      />
      <Button type="submit" className="create-button">
        Create Restaurant
      </Button>
    </View>
  </section>
);

// Restaurant List Component
const RestaurantList = ({ restaurantList, deleteARestaurant }) => (
  <section className="restaurant-list-section">
    <Heading level={4} className="section-heading">
      List of Restaurants ({restaurantList.length})
    </Heading>
    {restaurantList.length > 0 ? (
      <table className="restaurant-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>City</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {restaurantList.map((item, key) => (
            <RestaurantTableRow
              key={key}
              item={item}
              deleteARestaurant={deleteARestaurant}
            />
          ))}
        </tbody>
      </table>
    ) : (
      <p>No restaurants available. Please add one!</p>
    )}
  </section>
);

// Restaurant Table Row Component
const RestaurantTableRow = ({ item, deleteARestaurant }) => (
  <tr>
    <td>{item.name}</td>
    <td>{item.description}</td>
    <td>{item.city}</td>
    <td>
      <Button className="delete-button" onClick={() => deleteARestaurant(item)}>
        Delete
      </Button>
    </td>
  </tr>
);

// Footer Component with Sign Out Button
const Footer = ({ signOut }) => (
  <footer className="app-footer">
    <Button variation="primary" onClick={signOut} className="signout-button">
      Sign Out
    </Button>
  </footer>
);

// Main App Component
function App({ signOut }) {
  const [restaurantList, setRestaurantList] = useState([]);
  const [input, setInput] = useState({
    name: "",
    description: "",
    city: "",
  });

  const getRestaurantListFromAPI = async () => {
    const result = await client.graphql({ query: listRestaurants });
    const restaurantsFromAPI = result.data.listRestaurants.items;
    setRestaurantList(restaurantsFromAPI);
  };

  const createARestaurant = async (e) => {
    e.preventDefault();
    await client.graphql({
      query: createRestaurant,
      variables: { input: input },
    });
    getRestaurantListFromAPI();
    setInput({ name: "", description: "", city: "" });
  };

  const deleteARestaurant = async ({ id }) => {
    const newRestaurantList = restaurantList.filter((item) => item.id !== id);
    setRestaurantList(newRestaurantList);
    try {
      await client.graphql({
        query: deleteRestaurant,
        variables: { input: { id } },
      });
    } catch (e) {
      console.log({ Error: e?.message });
    }
  };

  useEffect(() => {
    getRestaurantListFromAPI();
  }, []);

  return (
    <React.Fragment>
      <Header />
      <main className="app-content">
        <RestaurantForm input={input} setInput={setInput} createARestaurant={createARestaurant} />
        <RestaurantList restaurantList={restaurantList} deleteARestaurant={deleteARestaurant} />
      </main>
      <Footer signOut={signOut} />
    </React.Fragment>
  );
}

export default withAuthenticator(App);
