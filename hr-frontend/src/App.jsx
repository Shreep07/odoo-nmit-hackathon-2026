import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Load employees from localStorage
  const [employees, setEmployees] = useState(() => {
    const savedEmployees = localStorage.getItem('employees')
    return savedEmployees ? JSON.parse(savedEmployees) : []
  })

  const [showForm, setShowForm] = useState(false)

  // QR attendance states
  const [qrStatus, setQrStatus] = useState('Waiting for scan')
  const [locationStatus, setLocationStatus] = useState('Not verified')
  const [blockchainStatus, setBlockchainStatus] = useState('Not recorded')
  const [attendanceStatus, setAttendanceStatus] = useState('Not checked in')
  const [isCheckedIn, setIsCheckedIn] = useState(false)

  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
  })

  // Save employees to localStorage
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees))
  }, [employees])

  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value,
    })
  }

  const addEmployee = (e) => {
    e.preventDefault()

    if (
      !employee.name ||
      !employee.email ||
      !employee.department ||
      !employee.role
    ) {
      alert('Please fill all fields')
      return
    }

    setEmployees([...employees, employee])

    setEmployee({
      name: '',
      email: '',
      department: '',
      role: '',
    })

    setShowForm(false)
  }

  // Scroll to attendance section
  const goToAttendance = () => {
    document.getElementById('attendance').scrollIntoView({
      behavior: 'smooth',
    })
  }

  // Temporary frontend flow for QR check-in
  const startCheckIn = () => {
    setQrStatus('QR verified')
    setLocationStatus('Location verified')
    setBlockchainStatus('Attendance verification pending')
    setAttendanceStatus('Processing check-in...')

    setTimeout(() => {
      setBlockchainStatus('Blockchain record confirmed')
      setAttendanceStatus('Checked in successfully')
      setIsCheckedIn(true)
    }, 1000)
  }

  // Temporary frontend flow for check-out
  const checkOut = () => {
    if (!isCheckedIn) {
      alert('Please check in first')
      return
    }

    setAttendanceStatus('Checked out successfully')
    setIsCheckedIn(false)
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <h2>HR Management</h2>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#employees">Employees</a>
          <a href="#attendance">Attendance</a>
          <a href="#leave">Leave</a>
        </nav>
      </header>

      {/* DASHBOARD */}
      <main id="dashboard" className="dashboard">

        <div className="welcome">
          <h1>HR Dashboard</h1>
          <p>Manage employees, attendance and leave in one place.</p>
        </div>

        {/* DASHBOARD CARDS */}
        <div className="cards">

          <div className="card">
            <h3>Total Employees</h3>
            <p className="number">{employees.length}</p>
          </div>

          <div className="card">
            <h3>Present Today</h3>
            <p className="number">
              {isCheckedIn ? 1 : 0}
            </p>
          </div>

          <div className="card">
            <h3>On Leave</h3>
            <p className="number">0</p>
          </div>

          <div className="card">
            <h3>Departments</h3>
            <p className="number">
              {[...new Set(employees.map((emp) => emp.department))].length}
            </p>
          </div>

        </div>

        {/* QUICK ACTIONS */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>

          <div className="actions">
            <button onClick={() => setShowForm(true)}>
              Add Employee
            </button>

            <button onClick={goToAttendance}>
              Mark Attendance
            </button>

            <button>
              Apply Leave
            </button>
          </div>
        </section>

        {/* EMPLOYEES */}
        <section id="employees" className="employees-section">

          <div className="section-header">
            <div>
              <h2>Employees</h2>
              <p>Manage your employees here.</p>
            </div>

            <button onClick={() => setShowForm(true)}>
              + Add Employee
            </button>
          </div>

          {/* ADD EMPLOYEE FORM */}
          {showForm && (
            <div className="employee-form">

              <h2>Add New Employee</h2>

              <form onSubmit={addEmployee}>

                <input
                  type="text"
                  name="name"
                  placeholder="Employee Name"
                  value={employee.name}
                  onChange={handleChange}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={employee.email}
                  onChange={handleChange}
                />

                <select
                  name="department"
                  value={employee.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  <option value="HR">HR</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                </select>

                <input
                  type="text"
                  name="role"
                  placeholder="Role"
                  value={employee.role}
                  onChange={handleChange}
                />

                <div className="form-buttons">
                  <button type="submit">
                    Add Employee
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>

              </form>

            </div>
          )}

          {/* EMPLOYEE LIST */}
          {employees.length === 0 ? (
            <div className="empty-state">
              <h3>No employees yet</h3>
              <p>Click "Add Employee" to add your first employee.</p>
            </div>
          ) : (
            <div className="employee-table">

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((emp, index) => (
                    <tr key={index}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>{emp.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}

        </section>

        {/* QR ATTENDANCE */}
        <section id="attendance" className="attendance-section">

          <div className="section-header">
            <div>
              <h2>QR Attendance</h2>
              <p>
                Verify your QR code and location to record attendance.
              </p>
            </div>
          </div>

          <div className="qr-attendance-card">

            <div className="qr-placeholder">
              <div className="qr-icon">▣</div>
              <p>QR Scanner</p>
              <span>Scan the company attendance QR code</span>
            </div>

            <div className="attendance-status">

              <div className="status-item">
                <span>QR Status</span>
                <strong>{qrStatus}</strong>
              </div>

              <div className="status-item">
                <span>Location Status</span>
                <strong>{locationStatus}</strong>
              </div>

              <div className="status-item">
                <span>Blockchain Status</span>
                <strong>{blockchainStatus}</strong>
              </div>

              <div className="status-item">
                <span>Attendance Status</span>
                <strong>{attendanceStatus}</strong>
              </div>

            </div>

            <div className="attendance-buttons">

              <button
                className="checkin-btn"
                onClick={startCheckIn}
                disabled={isCheckedIn}
              >
                {isCheckedIn ? 'Checked In' : 'Start QR Check-In'}
              </button>

              <button
                className="checkout-btn"
                onClick={checkOut}
              >
                Check Out
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}

export default App