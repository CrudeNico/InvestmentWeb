# Investment Tracker - Professional Portfolio Management

A modern, professional web application for tracking investment performance and managing investor relationships. Built with React, Vite, and Tailwind CSS.

## Features

### 🏠 Dashboard
- **Overview Metrics**: Starting balance, total growth, investor count, and average returns
- **Performance Summary**: Current balance, total net profit, and percentage calculations
- **Recent Activity**: Latest performance entries with growth tracking

### 📈 Investment Performance
- **Starting Balance Management**: Set and edit your initial investment amount
- **Monthly/Yearly Tracking**: Add performance entries with growth amounts and percentages
- **Performance Analytics**: Total growth, net percentage, average returns, and current balance
- **Data Management**: Edit and delete performance entries with full CRUD operations

### 👥 Investor Management
- **Investor Profiles**: Complete contact information (name, email, phone, investment amount)
- **Individual Performance Tracking**: Track each investor's growth separately
- **Performance Analytics**: Calculate individual investor returns and percentages
- **Bulk Overview**: Total invested amount and combined growth across all investors

### 💬 Chat System
- **Real-time Messaging**: Direct communication between admin and investors
- **Conversation Management**: Separate chat threads for each investor
- **Message History**: Persistent chat logs with timestamps
- **Unread Notifications**: Badge indicators for new messages
- **Role-based Access**: Investors can only see their own conversations

### 🔐 Security
- **Admin Authentication**: Secure login system with credential protection
- **Protected Routes**: All sensitive data requires authentication
- **Session Management**: Persistent login state with localStorage

## Demo Credentials
- **Username**: `admin`
- **Password**: `admin123`

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Database**: Firebase Firestore (with Local Storage fallback)
- **Authentication**: Firebase Authentication
- **Real-time Features**: Firebase Realtime Database

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Firebase account (for production deployment)

### Firebase Setup
1. Follow the [Firebase Setup Guide](./FIREBASE_SETUP.md) to configure your Firebase project
2. Update the Firebase configuration in `src/firebase/config.js`
3. Test the connection with your Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InvestmentWeb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup (Optional)**
   
   The app works with localStorage by default. To enable Firebase cloud storage:
   
   a. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   b. Enable Firestore Database
   c. Update `src/firebase/config.js` with your Firebase configuration
   d. Set up Firestore security rules (see `FIREBASE_SETUP.md`)
   
   **Note**: If Firebase is not configured, the app will automatically fall back to localStorage.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3001`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Usage Guide

### Setting Up Your Investment Portfolio

1. **Login**: Use the demo credentials to access the application
2. **Set Starting Balance**: Go to Investment Performance and set your initial investment amount
3. **Add Performance Entries**: Add monthly/yearly growth data with amounts and percentages
4. **Monitor Progress**: View your performance analytics on the dashboard

### Managing Investors

1. **Add Investors**: Navigate to the Investors section and add new investor profiles
2. **Track Performance**: Add individual performance entries for each investor
3. **Monitor Returns**: View individual and combined investor performance metrics

### Data Management

- **Firebase Firestore**: All data is stored in the cloud with real-time synchronization
- **Local Storage Fallback**: Data is also cached locally for offline access
- **Real-time Updates**: Changes are reflected instantly across all connected devices
- **Secure Authentication**: Firebase handles user authentication and security
- **Data Migration**: Easy migration from local storage to Firebase

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Sidebar.jsx     # Navigation sidebar
├── contexts/           # React context providers
│   ├── AuthContext.jsx # Authentication state management
│   └── DataContext.jsx # Investment and investor data management
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Overview dashboard
│   ├── InvestmentPerformance.jsx # Performance tracking
│   ├── Investors.jsx   # Investor management
│   └── Login.jsx       # Authentication page
├── App.jsx             # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## Customization

### Styling
The application uses Tailwind CSS with a custom design system. You can customize:
- Colors in `tailwind.config.js`
- Component styles in `src/index.css`
- Individual component styling

### Data Structure
The application is designed with a flexible data structure that can easily be adapted for:
- Firebase Firestore
- REST APIs
- GraphQL endpoints
- Other database systems

## Future Enhancements

- **Charts and Graphs**: Integration with Recharts for visual performance tracking
- **Export Functionality**: PDF reports and data export capabilities
- **Advanced Analytics**: Risk metrics, portfolio diversification analysis
- **Real-time Updates**: WebSocket integration for live data updates
- **Mobile App**: React Native version for mobile access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Note**: This application is designed for local development and testing. For production use, consider implementing proper authentication, data validation, and security measures.
