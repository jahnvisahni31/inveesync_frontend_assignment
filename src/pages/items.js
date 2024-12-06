import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [newItem, setNewItem] = useState({
    id: '',
    internal_item_name: '',
    type: 'Sell',
    uom: 'kgs', // Default value
    additional_attributes__avg_weight_needed: 'TRUE', // Default value
    min_buffer: '',
    max_buffer: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [csvData, setCsvData] = useState([]);
  
  const apiUrl = 'https://api-assignment.inveesync.in/items';

  // Fetch items from API
  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        const apiItems = response.data.map((item) => ({
          ...item,
          additional_attributes__avg_weight_needed: item.additional_attributes.avg_weight_needed,
        }));
        setItems(apiItems);
      })
      .catch((error) => console.error('Error fetching items:', error));
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // Add or Edit Item
  const handleAddItem = () => {
    const itemToSubmit = {
      ...newItem,
      id: newItem.id || Math.random().toString(36).substring(2, 9),
      additional_attributes: {
        avg_weight_needed: newItem.additional_attributes__avg_weight_needed,
      },
    };

    if (editingIndex !== null) {
      const updatedItem = { ...itemToSubmit };
      axios
        .put(`${apiUrl}/${items[editingIndex].id}`, updatedItem)
        .then((response) => {
          const updatedItems = items.map((item, index) =>
            index === editingIndex ? response.data : item
          );
          setItems(updatedItems);
          setEditingIndex(null);
        })
        .catch((error) => console.error('Error updating item:', error));
    } else {
      axios
        .post(apiUrl, itemToSubmit)
        .then((response) => {
          setItems([...items, response.data]);
        })
        .catch((error) => console.error('Error adding item:', error));
    }

    // Reset form
    setNewItem({
      id: '',
      internal_item_name: '',
      type: 'Sell',
      uom: 'kgs',
      additional_attributes__avg_weight_needed: 'TRUE',
      min_buffer: '',
      max_buffer: '',
    });
  };

  // Handle Delete Item
  const handleDeleteItem = (index) => {
    const itemToDelete = items[index];
    axios
      .delete(`${apiUrl}/${itemToDelete.id}`)
      .then(() => {
        setItems(items.filter((_, i) => i !== index));
      })
      .catch((error) => console.error('Error deleting item:', error));
  };

  // Handle Edit Item
  const handleEditItem = (index) => {
    const itemToEdit = items[index];
    setNewItem({
      ...itemToEdit,
      additional_attributes__avg_weight_needed: itemToEdit.additional_attributes.avg_weight_needed,
    });
    setEditingIndex(index);
  };

  // Validate Items
  const handleValidate = () => {
    const newErrors = [];
    const uniqueCombination = new Set();

    items.forEach((item, index) => {
      const key = `${item.internal_item_name}-${item.tenant_id}`;
      if (uniqueCombination.has(key)) {
        newErrors.push(`Row ${index + 1}: Duplicate internal_item_name and tenant_id combination.`);
      } else {
        uniqueCombination.add(key);
      }

      if (item.type.toLowerCase() === 'sell' && (!item.additional_attributes__avg_weight_needed || item.additional_attributes__avg_weight_needed.trim() === '')) {
        newErrors.push(`Row ${index + 1}: Avg Weight Needed is required for items with type "Sell".`);
      }

      const minBuffer = parseFloat(item.min_buffer) || 0;
      const maxBuffer = parseFloat(item.max_buffer) || 0;
      if (maxBuffer < minBuffer) {
        newErrors.push(`Row ${index + 1}: Max Buffer should be greater than or equal to Min Buffer.`);
      }
    });

    setErrors(newErrors);
    setValidationMessage(newErrors.length === 0 ? 'Validation Successful' : 'Validation Failed');
  };

  // Handle CSV File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        complete: (result) => {
          // Assuming the CSV has headers that match your item structure
          const uploadedItems = result.data.map((row) => ({
            internal_item_name: row['Internal Item Name'],
            type: row['Type'] || 'Sell',
            uom: row['Unit of Measurement'] || 'kgs',
            additional_attributes__avg_weight_needed: row['Avg Weight Needed'] || 'TRUE',
            min_buffer: row['Min Buffer'],
            max_buffer: row['Max Buffer'],
          }));

          // Add the items from CSV to current items list
          setCsvData(uploadedItems);
        },
        header: true, // Assumes the first row of the CSV contains headers
        skipEmptyLines: true,
      });
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff' }}>
      <h1 style={{ textAlign: 'center' }}>Items Management</h1>

      {/* Add/Edit Item Form */}
      <div>
        <h3>{editingIndex !== null ? 'Edit Item' : 'Add New Item'}</h3>
        <input
          type="text"
          name="internal_item_name"
          placeholder="Internal Item Name"
          value={newItem.internal_item_name}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <select name="type" value={newItem.type} onChange={handleInputChange} style={dropdownStyle}>
          <option value="Sell">Sell</option>
          <option value="Purchase">Purchase</option>
          <option value="Component">Component</option>
        </select>
        <select name="uom" value={newItem.uom} onChange={handleInputChange} style={dropdownStyle}>
          <option value="kgs">kgs</option>
          <option value="nos">nos</option>
        </select>
        <select
          name="additional_attributes__avg_weight_needed"
          value={newItem.additional_attributes__avg_weight_needed}
          onChange={handleInputChange}
          style={dropdownStyle}
        >
          <option value="TRUE">TRUE</option>
          <option value="FALSE">FALSE</option>
        </select>
        <input
          type="number"
          name="min_buffer"
          placeholder="Min Buffer"
          value={newItem.min_buffer}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <input
          type="number"
          name="max_buffer"
          placeholder="Max Buffer"
          value={newItem.max_buffer}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <button onClick={handleAddItem} style={buttonStyle}>
          {editingIndex !== null ? 'Update Item' : 'Save Item'}
        </button>
        <button onClick={handleValidate} style={buttonStyle}>Validate</button>
      </div>

      {/* CSV File Upload */}
      <div>
        <input type="file" accept=".csv" onChange={handleFileUpload} style={inputStyle} />
        <button onClick={handleValidate} style={buttonStyle}>Validate CSV Data</button>
      </div>

      {/* Validation Message */}
      {validationMessage && <strong>{validationMessage}</strong>}

      {/* Errors */}
      {errors.length > 0 && (
        <ul>
          {errors.map((error, index) => <li key={index} style={{ color: 'red' }}>{error}</li>)}
        </ul>
      )}

      {/* Items Table */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Internal Item Name</th>
            <th>Type</th>
            <th>Unit of Measurement</th>
            <th>Avg Weight Needed</th>
            <th>Min Buffer</th>
            <th>Max Buffer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...items, ...csvData].map((item, index) => (
            <tr key={item.id}>
              <td>{item.internal_item_name}</td>
              <td>{item.type}</td>
              <td>{item.uom}</td>
              <td>{item.additional_attributes__avg_weight_needed}</td>
              <td>{item.min_buffer}</td>
              <td>{item.max_buffer}</td>
              <td>
                <button onClick={() => handleEditItem(index)} style={buttonStyle}>Edit</button>
                <button onClick={() => handleDeleteItem(index)} style={buttonStyle}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const buttonStyle = {
  padding: '10px 20px',
  margin: '10px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const inputStyle = {
  margin: '5px',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: 'white', 
  color: '#000',
};

const dropdownStyle = {
  margin: '5px',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: 'white', 
  color: '#000',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  margin: '20px 0',
};

export default ItemsPage;
