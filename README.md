# Items Management App

This is a simple Items Management App built using React. The application allows users to manage items by performing CRUD operations, including adding, editing, deleting items, and validating data. It also supports CSV upload and download templates.

## Features

- **CSV Upload**: Upload a CSV file to populate the items table
- **Add New Item**: Form to add a new item with required fields
- **Edit Item**: Ability to edit an existing item
- **Delete Item**: Option to delete an item from the list
- **Data Validation**: Comprehensive validation system
- **CSV Template**: Download a sample CSV template for easy data import

## Technologies Used

- React
- PapaParse (for parsing CSV files)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/items-management-app.git
   cd items-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open the app in your browser at http://localhost:3000

## Usage

### Adding an Item
- Fill out the form with:
  - Internal Item Name
  - Type (Sell, Purchase, or Component)
  - Scrap Type (for Sell items)
  - Min Buffer
  - Max Buffer
- Click Save Item to add to the table

### Editing an Item
- Click Edit button next to the item
- Update the fields
- Click Update Item to save changes

### Deleting an Item
- Click Delete button next to the item

### Data Validation
- Click Validate button to check:
  - Duplicate internal item names
  - Required fields
  - Buffer quantity constraints

### CSV Operations
- Upload CSV: Use Choose File button
- Download Template: Click Download Template button

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature-branch`)
6. Open a pull request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
