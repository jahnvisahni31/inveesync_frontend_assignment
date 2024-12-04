import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const BomPage = () => {
  const [bomData, setBomData] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [newBomItem, setNewBomItem] = useState({
    id: '', 
    item_id: '',
    component_id: '',
    quantity: '',
    type: 'Sell',
  });
  const [errors, setErrors] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = 'https://api-assignment.inveesync.in/bom';

  // Fetch BOM Data from API
  const fetchBomData = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch BOM data');
      }
      const data = await response.json();
      setBomData(data);
      validateBomData(data); // Validate fetched data
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV Upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedData = result.data;
          setBomData(parsedData); 
          validateBomData(parsedData);
          assignNewId(parsedData); 
        },
      });
    }
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBomItem({ ...newBomItem, [name]: value });
  };

  // Generate a new ID based on existing BOM data
  const assignNewId = (data) => {
    const lastItem = data[data.length - 1];
    const newId = lastItem ? parseInt(lastItem.id, 10) + 1 : 1;
    setNewBomItem({ ...newBomItem, id: newId.toString() });
  };

  // Add New BOM Item to API
  const handleAddBomItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBomItem),
      });

      if (!response.ok) {
        throw new Error('Failed to add BOM item');
      }

      const data = await response.json();
      setBomData((prevData) => [...prevData, data]);
      validateBomData([...bomData, data]);
      assignNewId([...bomData, data]); 
      setNewBomItem({ id: '', item_id: '', component_id: '', quantity: '', type: 'Sell' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Validate BOM Data
  const validateBomData = (data) => {
    const newErrors = [];
    const pending = [];

    data.forEach((item, index) => {
      const duplicate = data.some(
        (existingItem, idx) =>
          existingItem.item_id === item.item_id &&
          existingItem.component_id === item.component_id &&
          idx !== index
      );
      if (duplicate) {
        newErrors.push(`Row ${index + 1}: Duplicate item_id + component_id combination.`);
      }

      if (item.quantity < 1 || item.quantity > 100) {
        newErrors.push(`Row ${index + 1}: Quantity must be between 1 and 100.`);
      }

      if (item.type === 'Sell' && !item.item_id) {
        pending.push(item);
      }

      if (item.type === 'Purchase' && !item.component_id) {
        pending.push(item);
      }

      if (item.type === 'Component' && (!item.item_id || !item.component_id)) {
        pending.push(item);
      }
    });

    setErrors(newErrors);
    setPendingJobs(pending);

    if (newErrors.length === 0) {
      setValidationMessage('Validation Successful');
    } else {
      setValidationMessage('Validation Failed');
    }
  };

  // Validate BOM Data on Button Click
  const handleValidateData = () => {
    validateBomData(bomData); 
  };

  // Download Template CSV
  const handleDownloadTemplate = () => {
    const template = 'id,item_id,component_id,quantity,created_by,last_updated_by,createdAt,updatedAt\n1,ITEM001,COMP001,10,User,User,2023-12-01,2023-12-01';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bom_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Edit BOM Item (by Index)
  const handleEditBomItem = (index) => {
    const item = bomData[index];
    setNewBomItem({
      id: item.id,
      item_id: item.item_id,
      component_id: item.component_id,
      quantity: item.quantity,
      type: item.type || 'Sell',
    });
  };

  // Delete BOM Item (by Index)
  const handleDeleteBomItem = async (index) => {
    setLoading(true);
    try {
      const itemToDelete = bomData[index];
      const response = await fetch(`${apiUrl}/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete BOM item');
      }

      const updatedBomData = bomData.filter((_, idx) => idx !== index);
      setBomData(updatedBomData);
      validateBomData(updatedBomData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBomData(); // Fetch BOM data when the component mounts
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff' }}>
      <h1 style={{ textAlign: 'center' }}>Bill of Materials (BoM)</h1>

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

      {/* Add New BOM Item Form */}
      <div style={{ marginTop: '20px' }}>
        <h3>Add New BOM Item</h3>
        <input
          type="text"
          name="id"
          placeholder="ID"
          value={newBomItem.id}
          onChange={handleInputChange}
          style={inputStyle}
          disabled
        />
        <input
          type="text"
          name="item_id"
          placeholder="Item ID"
          value={newBomItem.item_id}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <input
          type="text"
          name="component_id"
          placeholder="Component ID"
          value={newBomItem.component_id}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={newBomItem.quantity}
          onChange={handleInputChange}
          style={inputStyle}
        />

        {/* Dropdown for Type */}
        <select
          name="type"
          value={newBomItem.type}
          onChange={handleInputChange}
          style={inputStyle}
        >
          <option value="Sell">Sell</option>
          <option value="Purchase">Purchase</option>
          <option value="Component">Component</option>
        </select>

        <button onClick={handleAddBomItem} style={buttonStyle} disabled={loading}>
          {loading ? 'Saving...' : 'Save Item'}
        </button>
      </div>

      {/* Validation Button */}
      <button onClick={handleValidateData} style={validateButtonStyle}>
        Validate Data
      </button>

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

      {/* Pending Jobs */}
      {pendingJobs.length > 0 && (
        <div style={{ color: 'yellow', marginTop: '20px' }}>
          <h4>Pending Jobs:</h4>
          <ul>
            {pendingJobs.map((job, index) => (
              <li key={index}>{`Item ID: ${job.item_id}, Component ID: ${job.component_id}`}</li>
            ))}
          </ul>
        </div>
      )}

      {/* BoM Table */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Item ID</th>
            <th>Component ID</th>
            <th>Quantity</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bomData.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.item_id}</td>
              <td>{item.component_id}</td>
              <td>{item.quantity}</td>
              <td>{item.type}</td>
              <td>
                <button
                  onClick={() => handleEditBomItem(index)}
                  style={editButtonStyle}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBomItem(index)}
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

const validateButtonStyle = {
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  cursor: 'pointer',
  display: 'block',
  margin: '10px auto',
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
  padding: '10px',
  marginBottom: '10px',
  width: '100%',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: '#000',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
};

export default BomPage;
