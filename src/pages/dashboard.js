import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Fetch items and BOM data from APIs
    Promise.all([
      axios.get('https://api-assignment.inveesync.in/items'),
      axios.get('https://api-assignment.inveesync.in/bom')
    ])
      .then(([itemsResponse, bomsResponse]) => {
        setItems(itemsResponse.data);
        setBoms(bomsResponse.data);
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false if error occurs
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while fetching data
  }

  // Data for Item Types Pie Chart
  const itemTypeCount = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const itemTypeData = Object.keys(itemTypeCount).map((type) => ({
    name: type,
    value: itemTypeCount[type],
  }));

  // Data for BOM Quantity Pie Chart
  const bomQuantityCount = boms.reduce((acc, bom) => {
    const { item_id, quantity } = bom;
    acc[item_id] = (acc[item_id] || 0) + quantity;
    return acc;
  }, {});

  const bomQuantityData = Object.keys(bomQuantityCount).map((item_id) => ({
    name: `Item ${item_id}`,
    value: bomQuantityCount[item_id],
  }));

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff' }}>
      <h1 style={{ textAlign: 'center' }}>Dashboard</h1>

      {/* Graphs */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Item Types Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={itemTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {itemTypeData.map((entry, index) => (
                <Cell key={index} fill={index === 0 ? '#00C49F' : '#FFBB28'} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>BOM Quantity Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={bomQuantityData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {bomQuantityData.map((entry, index) => (
                <Cell key={index} fill={index === 0 ? '#8884d8' : '#82ca9d'} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Dashboard;

