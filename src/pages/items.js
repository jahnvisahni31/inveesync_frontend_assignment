import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [newItem, setNewItem] = useState({
    internal_item_name: '',
    type: 'Sell',
    uom: 'Nos',
    additional_attributes__scrap_type: '',
    min_buffer: '',
    max_buffer: '',
  });
  const [editingIndex, setEditingIndex] = useState(null); // Track the item being edited

  const apiUrl = 'https://api-assignment.inveesync.in/items';

  // Define styles
  const buttonStyle = {
    backgroundColor: '#4CAF50', // Green background
    color: 'white',
    padding: '10px 20px',
    margin: '5px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const inputStyle = {
    padding: '8px',
    margin: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '200px',
    backgroundColor: '#000',
  };

  const dropdownStyle = {
    padding: '8px',
    margin: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '210px',
    backgroundColor: '#000',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const editButtonStyle = {
    backgroundColor: '#FFA500', // Orange background for Edit
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  };

  const deleteButtonStyle = {
    backgroundColor: '#f44336', // Red background for Delete
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  };

  // Fetch items from the remote API when the component mounts
  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        setItems(response.data); // Set the items fetched from API
      })
      .catch((error) => console.error('Error fetching items:', error));
  }, []);

  // Handle CSV Upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedItems = result.data;
          // Save parsed items to API
          parsedItems.forEach((item) => {
            axios
              .post(apiUrl, item)
              .then((response) => {
                setItems((prevItems) => [...prevItems, response.data]); // Update state with new item
              })
              .catch((error) => console.error('Error adding item to API:', error));
          });
        },
      });
    }
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // Add or Edit Item
  const handleAddItem = () => {
    if (editingIndex !== null) {
      // Edit existing item
      const updatedItems = items.map((item, index) =>
        index === editingIndex ? newItem : item
      );
      setItems(updatedItems);
      setEditingIndex(null); // Reset editing mode

      // Update item on the server
      axios
        .put(`${apiUrl}/${newItem._id}`, newItem)
        .then((response) => {
          // Successful update
        })
        .catch((error) => console.error('Error updating item:', error));
    } else {
      // Add new item
      axios
        .post(apiUrl, newItem)
        .then((response) => {
          setItems([...items, response.data]); // Add the new item to state
        })
        .catch((error) => console.error('Error adding item:', error));
    }

    setNewItem({
      internal_item_name: '',
      type: 'Sell',
      uom: 'Nos',
      additional_attributes__scrap_type: '',
      min_buffer: '',
      max_buffer: '',
    });
  };

  // Validate Data
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

      // Scrap Type validation for "Sell"
      if (item.type.toLowerCase() === 'sell' && (!item.additional_attributes__scrap_type || item.additional_attributes__scrap_type.trim() === 'scrap_a' || item.additional_attributes__scrap_type.trim() === 'scrap_b')) {
        newErrors.push(`Row ${index + 1}: Scrap Type is required for items with type "Sell".`);
      }

      // Min Buffer validation for "Sell" and "Purchase"
      if ((item.type.toLowerCase() === 'sell' || item.type.toLowerCase() === 'purchase') && (!item.min_buffer || item.min_buffer.trim() === '')) {
        newErrors.push(`Row ${index + 1}: Min Buffer is required for "Sell" and "Purchase" items.`);
      }

      // Max Buffer >= Min Buffer validation
      const minBuffer = parseFloat(item.min_buffer) || 0;
      const maxBuffer = parseFloat(item.max_buffer) || 0;

      if (maxBuffer < minBuffer) {
        newErrors.push(`Row ${index + 1}: Max Buffer should be greater than or equal to Min Buffer.`);
      }

      // Default Min/Max Buffer to 0 if null
      if (!item.min_buffer) item.min_buffer = '0';
      if (!item.max_buffer) item.max_buffer = '0';
    });

    setErrors(newErrors);
    if (newErrors.length === 0) {
      setValidationMessage('Validation Successful');
    } else {
      setValidationMessage('Validation Failed');
    }
  };

  // Download Template CSV
  const handleDownloadTemplate = () => {
    const template = 'internal_item_name,type,uom,additional_attributes__scrap_type,min_buffer,max_buffer\nSample Item,Sell,Nos,Scrap A,10,20';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Delete Item
  const handleDeleteItem = (index) => {
    const itemToDelete = items[index];
    axios
      .delete(`${apiUrl}/${itemToDelete._id}`)
      .then(() => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
      })
      .catch((error) => console.error('Error deleting item:', error));
  };

  // Handle Edit Item
  const handleEditItem = (index) => {
    setNewItem(items[index]);
    setEditingIndex(index);
  };

  return (
    <div>
      {/* CSV Upload */}
      <input type="file" accept=".csv" onChange={handleCSVUpload} />

      {/* Item Form */}
      <div>
        <input
          type="text"
          name="internal_item_name"
          placeholder="Internal Item Name"
          value={newItem.internal_item_name}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <select
          name="type"
          value={newItem.type}
          onChange={handleInputChange}
          style={dropdownStyle}
        >
          <option value="Sell">Sell</option>
          <option value="Purchase">Purchase</option>
        </select>
        <input
          type="text"
          name="uom"
          placeholder="Unit of Measurement"
          value={newItem.uom}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <input
          type="text"
          name="additional_attributes__scrap_type"
          placeholder="Scrap Type"
          value={newItem.additional_attributes__scrap_type}
          onChange={handleInputChange}
          style={inputStyle}
        />
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
        <button onClick={handleValidate} style={buttonStyle}>
          Validate
        </button>
      </div>

      {/* Validation Message */}
      {validationMessage && (
        <div style={{ marginTop: '20px', color: validationMessage === 'Validation Successful' ? 'green' : 'red' }}>
          <strong>{validationMessage}</strong>
        </div>
      )}

      {/* Error Display */}
      {errors.length > 0 && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h4>Validation Errors:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Items Table */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Internal Item Name</th>
            <th>Type</th>
            <th>Unit of Measurement</th>
            <th>Scrap Type</th>
            <th>Min Buffer</th>
            <th>Max Buffer</th>
            <th>Actions</th> {/* Added Actions column for edit and delete */}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.internal_item_name}</td>
              <td>{item.type}</td>
              <td>{item.uom}</td>
              <td>{item.additional_attributes__scrap_type}</td>
              <td>{item.min_buffer}</td>
              <td>{item.max_buffer}</td>
              <td>
                <button
                  onClick={() => handleEditItem(index)} // Edit button functionality
                  style={editButtonStyle}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteItem(index)} // Delete button functionality
                  style={deleteButtonStyle}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsPage;
