# CSV File Upload and List Web Application

This is a web application for uploading and listing CSV files.

### Functional Features

- **Upload CSV Files**: Users can upload CSV files through the web interface.
- **List Uploaded CSV Files**: View a list of all uploaded CSV files.
- **View CSV Data**: Open and view the content of the uploaded CSV files.
- **Search CSV Data**: Search through CSV file content for specific data.
- **Delete Uploaded CSV Files**: Remove uploaded CSV files and associated data.
- **Describe CSV Columns**: Users can select a column from the CSV file and add descriptive information about what that column represents (e.g., column purpose, data format).
- **Real-Time Notifications**: Receive instant feedback about upload success or failure through Socket.IO.

### Non-Functional Features

- **Asynchronous Processing**: CSV files are processed in the background using a queuing system with Bull, ensuring that large files do not slow down the application.
- **Caching**: Redis is used to cache frequently accessed data (e.g., file lists, column headers) to improve performance and reduce database load.
- **Scalability**: The queuing system allows the application to handle large volumes of CSV files without impacting overall performance.
- **Socket.IO for Real-Time Updates**: Users receive real-time updates and feedback during file uploads and processing.

### 1. Clone the repository

   ```bash
   git clone <repository-url>
   cd csvUpload
   ```

### 2. Install dependencies

   ```bash
   npm install
   ```

npm install

### 3. Configure Environment Variables

   Create a `.env` file in the root directory with the following values:

   ```env
   DATABASE=your_mongodb_database
   SECRETKEY1=your_secret_key
   ```

### 4. Start the Application

You need to run both the web server and the background worker for CSV processing.

- **Start the Web Server:**

   ```bash
   npm start
   ```

- **Start the Worker Process:**

   ```bash
   node workers/csvWorker.js
   ```

The application will be available at `http://localhost:8000`.

Project Structure
   ```bash
.
├── assets
│   ├── css
│   │   ├── csv.css
│   │   └── dashboard.css
│   └── js
│       ├── column.js
│       ├── csv.js
│       ├── dashboard.js
│       └── home.js
├── a.txt
├── config
│   ├── middleware.js
│   ├── mongoose.js
│   ├── passport.js
│   ├── queue.js
│   ├── redisClient.js
│   └── roleCheck.js
├── controllers
│   ├── authController.js
│   ├── csvController.js
│   ├── dashboardController.js
│   └── socketController.js
├── index.js
├── models
│   ├── csv.js
│   ├── group.js
│   ├── token.js
│   └── user.js
├── package.json
├── package-lock.json
├── README.md
├── routes
│   └── index.js
├── uploads
│   └── files
│       ├── 1725302025066-fetal_health1.csv
│       └── 1725475926041-ruby.csv
├── views
│   ├── column.ejs
│   ├── csv.ejs
│   ├── dashboarda.ejs
│   ├── dashboard.ejs
│   ├── _footer.ejs
│   ├── _header.ejs
│   ├── home.ejs
│   ├── layout.ejs
│   ├── login.ejs
│   └── signup.ejs
└── workers
    └── csvWorker.js
```

## Usage

1. Access the web interface at `http://localhost:8000`.
2. Upload CSV files using the file upload form.
3. View the uploaded files and perform searches within them.
4. Select a column and describe it with additional information (e.g., what the column represents, expected data format).
5. Receive real-time feedback on the status of your file uploads.

## Contributing

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature
   ```

3. **Commit your changes**

   ```bash
   git commit -m 'Add some feature'
   ```

4. **Push to the branch**

   ```bash
   git push origin feature/your-feature
   ```

5. **Create a pull request** on GitHub.

## Acknowledgements

- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [Socket.IO](https://socket.io/)
- [Bull Queue](https://bullmq.io/)


### New Feature Added
- **Describe CSV Columns**: Users can select a specific column from the uploaded CSV and provide a description of what the column represents, making the data easier to understand and work with.