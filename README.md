# SpendWise - Interactive Expense Tracker

**Internship Task 40 | Frontend Web Application**

SpendWise is a responsive, browser-based expense tracker built with HTML5, CSS3, and vanilla JavaScript. Users can record expenses, organize them by category, review spending totals, and search or filter transactions.

## Features

- Add expenses with a name, amount, category, date, and optional notes
- Edit and delete saved expenses
- Confirmation before deleting a record
- Calculate total expenses, current-month spending, and transaction count
- Category-wise spending breakdown with progress bars
- Search by expense name, category, or notes
- Filter by category and date range
- Sort by newest, oldest, highest amount, or lowest amount
- Save records in browser `localStorage`
- Responsive desktop, tablet, and mobile layout
- Validate required fields and positive amounts
- Format amounts in Indian Rupees (INR)

## Technologies

- HTML5 for semantic structure and form controls
- CSS3 for responsive layout, cards, colors, and progress bars
- JavaScript for DOM manipulation, event handling, calculations, search, filtering, sorting, and validation
- LocalStorage for browser-based data persistence
- Google Fonts for DM Sans and Manrope typography

## Project Structure

```text
Day_40_Interactive_Expense_Tracker/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run

1. Extract the project folder.
2. Open it in Visual Studio Code.
3. Open `index.html` in a browser.
4. Optional: install the Live Server extension, right-click `index.html`, and choose **Open with Live Server**.

No package installation, API key, backend server, or database is required.

## How to Use

1. Enter an expense name and amount.
2. Select a category and date.
3. Add a note if needed.
4. Click **Save expense**.
5. Review the summary cards and category breakdown.
6. Search, filter, or sort transactions in the records section.
7. Use the pencil icon to edit an expense or the cross icon to delete it.
8. Click **Reset** to clear the active filters.

## Data Storage and Privacy

Expense records are stored in `localStorage` in the browser where the application is used. They remain available after a refresh in that browser profile, but they are not synchronized across browsers or devices. Clearing browser site data can remove saved records. This frontend project does not include user accounts, cloud synchronization, or a remote database.

## Validation Rules

- Expense name must contain at least two characters.
- Amount must be a valid number greater than zero.
- A date must be selected.
- Notes are optional.
- A confirmation prompt appears before deletion.

## Learning Outcomes

This project provides practice with JavaScript objects and arrays, DOM manipulation, event listeners, form submission, input validation, localStorage, `filter()`, `map()`, `sort()`, `reduce()`, dynamic UI updates, currency formatting, date filtering, and responsive design.

## Limitations

- Data is stored only in the current browser.
- There is no login, cloud sync, or multi-user support.
- Category breakdown summarizes all recorded expenses, while the transaction list can be filtered.
- This learning project is not a replacement for accounting or financial software.

## Future Enhancements

- Monthly budgets and budget alerts
- Weekly and monthly charts
- Export to CSV or PDF
- Recurring expenses
- Income and balance tracking
- User authentication and cloud database integration
- Currency selection and dark mode

## Interview Questions

**1. How is an expense represented?**  
Each expense is a JavaScript object with an ID, title, amount, category, date, and notes.

**2. Why use localStorage?**  
It stores data in the browser so records can remain after a page refresh.

**3. How are totals calculated?**  
The `reduce()` method adds up the amount of each expense.

**4. How do filters work?**  
The application checks each expense against the search query, category, and date range, then renders the matching records.

**5. How does editing work?**  
The selected expense is loaded into the form. On submission, the matching object is replaced and saved.

## Project Information

- **Project:** SpendWise - Interactive Expense Tracker
- **Internship Task:** Day 40
- **Type:** Frontend web application
- **Author:** Add your name before submission
