import { useState } from 'react';
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

  // Handle CSV Upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setItems(result.data); // Set parsed CSV data to table
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
    } else {
      // Add new item
      setItems([...items, newItem]);
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
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems); // Update the state to re-render the table
  };

  // Handle Edit Item
  const handleEditItem = (index) => {
    const itemToEdit = items[index];
    setNewItem({
      internal_item_name: itemToEdit.internal_item_name,
      type: itemToEdit.type,
      uom: itemToEdit.uom,
      additional_attributes__scrap_type: itemToEdit.additional_attributes__scrap_type,
      min_buffer: itemToEdit.min_buffer,
      max_buffer: itemToEdit.max_buffer,
    });
    setEditingIndex(index); // Set the editing index
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff' }}>
      <h1 style={{ textAlign: 'center' }}>Items Management</h1>

      {/* CSV Upload Button */}
      <input
        type="file"
        accept=".csv"
        onChange={handleCSVUpload}
        style={{ display: 'block', margin: '10px auto', color: '#fff' }}
      />

      {/* Download Template Button */}
      <button onClick={handleDownloadTemplate} style={buttonStyle}>
        Download Template
      </button>

      {/* Add or Edit Item Form */}
      <div style={{ marginTop: '20px' }}>
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

// Style Definitions
const buttonStyle = {
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  margin: '10px 0',
  cursor: 'pointer',
  display: 'block',
  textAlign: 'center',
};

const editButtonStyle = {
  backgroundColor: 'orange',
  color: '#fff',
  padding: '5px 10px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginRight: '10px',
};

const deleteButtonStyle = {
  backgroundColor: 'red',
  color: '#fff',
  padding: '5px 10px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  backgroundColor: '#000',
  border: '1px solid #fff',
  borderRadius: '5px',
  boxSizing: 'border-box',
};

const dropdownStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  backgroundColor: '#000',
  color: '#fff',
  border: '1px solid #fff',
};

const tableStyle = {
  width: '100%',
  marginTop: '20px',
  borderCollapse: 'collapse',
};

export default ItemsPage;
