import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Welcome from './pages/Auth/Welcome';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import VerifyOTP from './pages/Auth/VerifyOTP';
import ProfileSetup from './pages/Auth/ProfileSetup';
import TruckSetup from './pages/Auth/TruckSetup';
import Dashboard from './pages/Dashboard/Dashboard';
import AddTrip from './pages/Trips/AddTrip';
import TripList from './pages/Trips/TripList';
import PaymentList from './pages/Payments/PaymentList';
import AddPayment from './pages/Payments/AddPayment';
import DriverList from './pages/Drivers/DriverList';
import AddDriver from './pages/Drivers/AddDriver';
import DriverDetails from './pages/Drivers/DriverDetails';
import Expenses from './pages/Management/Expenses';
import ExpenseList from './pages/Management/ExpenseList';
import SupplierList from './pages/Suppliers/SupplierList';
import AddSupplier from './pages/Suppliers/AddSupplier';
import MaterialList from './pages/Materials/MaterialList';
import AddMaterial from './pages/Materials/AddMaterial';
import FuelExpenseList from './pages/Fuel/FuelExpenseList';
import AddFuelExpense from './pages/Fuel/AddFuelExpense';
import PetrolPumpList from './pages/Fuel/PetrolPumpList';
import AddPetrolPump from './pages/Fuel/AddPetrolPump';
import Reminders from './pages/Management/Reminders';
import Settings from './pages/Settings/Settings';
import EditProfile from './pages/Settings/EditProfile';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SubscriptionGuard from './components/auth/SubscriptionGuard';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth.jsx';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              border: '2px solid black',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              color: 'var(--color-text-main)',
              fontWeight: 900,
              boxShadow: '4px 4px 0px black',
              background: 'white'
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-error)',
                secondary: 'white',
              },
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<VerifyOTP />} />
            <Route path="/profile-setup" element={<ProtectedRoute><MainLayout><ProfileSetup /></MainLayout></ProtectedRoute>} />
            <Route path="/truck-setup" element={<ProtectedRoute><MainLayout><TruckSetup /></MainLayout></ProtectedRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><MainLayout><Dashboard /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-trip" element={<ProtectedRoute><SubscriptionGuard><MainLayout><AddTrip /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><SubscriptionGuard><MainLayout><TripList /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><SubscriptionGuard><MainLayout><PaymentList /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-payment" element={<ProtectedRoute><SubscriptionGuard><MainLayout><AddPayment /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/drivers" element={<ProtectedRoute><SubscriptionGuard><MainLayout><DriverList /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/driver-details/:id" element={<ProtectedRoute><SubscriptionGuard><MainLayout><DriverDetails /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-driver" element={<ProtectedRoute><SubscriptionGuard><MainLayout><AddDriver /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/edit-driver/:id" element={<ProtectedRoute><SubscriptionGuard><MainLayout><AddDriver /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><SubscriptionGuard><MainLayout><SupplierList /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-supplier" element={<ProtectedRoute><SubscriptionGuard><MainLayout><AddSupplier /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/materials" element={<ProtectedRoute><SubscriptionGuard><MainLayout><MaterialList /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-material" element={<ProtectedRoute><SubscriptionGuard><MainLayout><AddMaterial /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/fuel-expenses" element={<ProtectedRoute><SubscriptionGuard><MainLayout><FuelExpenseList /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-fuel-expense" element={<ProtectedRoute><SubscriptionGuard><MainLayout><AddFuelExpense /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/petrol-pumps" element={<ProtectedRoute><SubscriptionGuard><MainLayout><PetrolPumpList /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-petrol-pump" element={<ProtectedRoute><SubscriptionGuard><MainLayout><AddPetrolPump /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><SubscriptionGuard><MainLayout><ExpenseList /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-expense" element={<ProtectedRoute><SubscriptionGuard><MainLayout><Expenses /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/add-reminder" element={<ProtectedRoute><SubscriptionGuard><MainLayout><Reminders /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SubscriptionGuard><MainLayout><Settings /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><SubscriptionGuard><MainLayout><EditProfile /></MainLayout></SubscriptionGuard></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
