import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:5001'

function App() {
  const [employees, setEmployees] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)

  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
  })

  const [qrStatus, setQrStatus] = useState('Waiting for scan')
  const [locationStatus, setLocationStatus] = useState('Not verified')
  const [blockchainStatus, setBlockchainStatus] = useState('Not recorded')
  const [attendanceStatus, setAttendanceStatus] = useState('Not checked in')
  const [isCheckedIn, setIsCheckedIn] = useState(false)

  useEffect(() => {
    loadData()
    fetchAttendance()
  }, [])

  const loadData = async () => {
    setLoading(true)

    await Promise.all([
      fetchEmployees(),
      fetchLeaves(),
    ])

    setLoading(false)
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        `${API_URL}/employees`
      )

      if (!response.ok) {
        throw new Error('Failed to load employees')
      }

      const data = await response.json()

      setEmployees(data)
    } catch (error) {
      console.error(
        'Error loading employees:',
        error
      )
    }
  }

  const fetchLeaves = async () => {
    try {
      const response = await fetch(
        `${API_URL}/leaves`
      )

      if (!response.ok) {
        throw new Error('Failed to load leaves')
      }

      const data = await response.json()

      setLeaveRequests(data)
    } catch (error) {
      console.error(
        'Error loading leave requests:',
        error
      )
    }
  }

  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        `${API_URL}/attendance`
      )

      if (!response.ok) {
        throw new Error(
          'Failed to load attendance'
        )
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        const latestAttendance =
          data[data.length - 1]

        setQrStatus(
          latestAttendance.qrStatus === 'Verified'
            ? 'QR verified'
            : latestAttendance.qrStatus
        )

        setLocationStatus(
          latestAttendance.locationStatus === 'Verified'
            ? 'Location verified'
            : latestAttendance.locationStatus
        )

        setBlockchainStatus(
          latestAttendance.blockchainStatus === 'Recorded'
            ? 'Blockchain record confirmed'
            : latestAttendance.blockchainStatus
        )

        if (
          latestAttendance.status ===
          'Checked In'
        ) {
          setAttendanceStatus(
            'Checked in successfully'
          )

          setIsCheckedIn(true)
        } else if (
          latestAttendance.status ===
          'Checked Out'
        ) {
          setAttendanceStatus(
            'Checked out successfully'
          )

          setIsCheckedIn(false)
        }
      }
    } catch (error) {
      console.error(
        'Error loading attendance:',
        error
      )
    }
  }

  const handleChange = (e) => {
    setEmployee({
      ...employee,
      [e.target.name]: e.target.value,
    })
  }

  const addEmployee = async (e) => {
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

    try {
      const response = await fetch(
        `${API_URL}/employees`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(employee),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to add employee'
        )
      }

      const data = await response.json()

      const newEmployee =
        data.employee || data

      setEmployees(
        (previousEmployees) => [
          ...previousEmployees,
          newEmployee,
        ]
      )

      setEmployee({
        name: '',
        email: '',
        department: '',
        role: '',
      })

      setShowForm(false)

      alert(
        'Employee added successfully'
      )
    } catch (error) {
      console.error(
        'Error adding employee:',
        error
      )

      alert(
        'Could not add employee. Check if the backend is running.'
      )
    }
  }

  const goToAttendance = () => {
    document
      .getElementById('attendance')
      ?.scrollIntoView({
        behavior: 'smooth',
      })
  }

  const startCheckIn = async () => {
    if (isCheckedIn || attendanceLoading) {
      return
    }

    setAttendanceLoading(true)

    setQrStatus('Verifying...')
    setLocationStatus('Verifying...')
    setBlockchainStatus('Recording...')
    setAttendanceStatus(
      'Processing check-in...'
    )

    try {
      const response = await fetch(
        `${API_URL}/attendance/check-in`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            employee: 'Demo Employee',
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Check-in failed'
        )
      }

      const data = await response.json()

      const attendance =
        data.attendance

      setQrStatus(
        attendance.qrStatus === 'Verified'
          ? 'QR verified'
          : attendance.qrStatus
      )

      setLocationStatus(
        attendance.locationStatus === 'Verified'
          ? 'Location verified'
          : attendance.locationStatus
      )

      setBlockchainStatus(
        attendance.blockchainStatus === 'Recorded'
          ? 'Blockchain record confirmed'
          : attendance.blockchainStatus
      )

      setAttendanceStatus(
        'Checked in successfully'
      )

      setIsCheckedIn(true)

      alert('Check-in successful')
    } catch (error) {
      console.error(
        'Check-in error:',
        error
      )

      setQrStatus('Waiting for scan')
      setLocationStatus('Not verified')
      setBlockchainStatus('Not recorded')
      setAttendanceStatus(
        'Check-in failed'
      )

      alert(
        'Check-in failed. Make sure the backend is running.'
      )
    } finally {
      setAttendanceLoading(false)
    }
  }

  const checkOut = async () => {
    if (!isCheckedIn) {
      alert('Please check in first')
      return
    }

    if (attendanceLoading) {
      return
    }

    setAttendanceLoading(true)

    setAttendanceStatus(
      'Processing check-out...'
    )

    try {
      const response = await fetch(
        `${API_URL}/attendance/check-out`,
        {
          method: 'PUT',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Check-out failed'
        )
      }

      const data = await response.json()

      const attendance =
        data.attendance

      setQrStatus(
        attendance.qrStatus === 'Verified'
          ? 'QR verified'
          : attendance.qrStatus
      )

      setLocationStatus(
        attendance.locationStatus === 'Verified'
          ? 'Location verified'
          : attendance.locationStatus
      )

      setBlockchainStatus(
        attendance.blockchainStatus === 'Recorded'
          ? 'Blockchain record confirmed'
          : attendance.blockchainStatus
      )

      setAttendanceStatus(
        'Checked out successfully'
      )

      setIsCheckedIn(false)

      alert('Check-out successful')
    } catch (error) {
      console.error(
        'Check-out error:',
        error
      )

      setAttendanceStatus(
        'Check-out failed'
      )

      alert(
        'Check-out failed. Make sure the backend is running.'
      )
    } finally {
      setAttendanceLoading(false)
    }
  }

  const approveLeave = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/leaves/${id}/approve`,
        {
          method: 'PUT',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to approve leave'
        )
      }

      const data = await response.json()

      setLeaveRequests(
        (requests) =>
          requests.map((request) =>
            request.id === id
              ? data.leave
              : request
          )
      )

      alert(
        'Leave approved successfully'
      )
    } catch (error) {
      console.error(
        'Error approving leave:',
        error
      )

      alert(
        'Could not approve leave request'
      )
    }
  }

  const rejectLeave = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/leaves/${id}/reject`,
        {
          method: 'PUT',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to reject leave'
        )
      }

      const data = await response.json()

      setLeaveRequests(
        (requests) =>
          requests.map((request) =>
            request.id === id
              ? data.leave
              : request
          )
      )

      alert(
        'Leave rejected successfully'
      )
    } catch (error) {
      console.error(
        'Error rejecting leave:',
        error
      )

      alert(
        'Could not reject leave request'
      )
    }
  }

  const presentToday =
    isCheckedIn ? 1 : 0

  const onLeaveCount =
    leaveRequests.filter(
      (request) =>
        request.status === 'Approved'
    ).length

  const pendingLeaveCount =
    leaveRequests.filter(
      (request) =>
        request.status === 'Pending'
    ).length

  const departmentCount = [
    ...new Set(
      employees
        .map(
          (emp) => emp.department
        )
        .filter(Boolean)
    ),
  ].length

  return (
    <div className="app">
      <header className="navbar">
        <h2>HR Management</h2>

        <nav>
          <a href="#dashboard">
            Dashboard
          </a>

          <a href="#employees">
            Employees
          </a>

          <a href="#attendance">
            Attendance
          </a>

          <a href="#leave">
            Leave Management
          </a>
        </nav>
      </header>

      <main
        id="dashboard"
        className="dashboard"
      >
        <div className="welcome">
          <h1>HR Dashboard</h1>

          <p>
            Manage employees, attendance
            and leave requests in one place.
          </p>
        </div>

        <div className="cards">
          <div className="card">
            <h3>Total Employees</h3>

            <p className="number">
              {employees.length}
            </p>
          </div>

          <div className="card">
            <h3>Present Today</h3>

            <p className="number">
              {presentToday}
            </p>
          </div>

          <div className="card">
            <h3>On Leave</h3>

            <p className="number">
              {onLeaveCount}
            </p>
          </div>

          <div className="card">
            <h3>Pending Leaves</h3>

            <p className="number">
              {pendingLeaveCount}
            </p>
          </div>

          <div className="card">
            <h3>Departments</h3>

            <p className="number">
              {departmentCount}
            </p>
          </div>
        </div>

        <section className="quick-actions">
          <h2>Quick Actions</h2>

          <div className="actions">
            <button
              onClick={() =>
                setShowForm(true)
              }
            >
              Add Employee
            </button>

            <button
              onClick={goToAttendance}
            >
              Mark Attendance
            </button>

            <button
              onClick={() =>
                document
                  .getElementById('leave')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                  })
              }
            >
              Manage Leave Requests
            </button>

            <button
              onClick={() => {
                loadData()
                fetchAttendance()
              }}
            >
              Refresh Data
            </button>
          </div>
        </section>

        <section
          id="employees"
          className="employees-section"
        >
          <div className="section-header">
            <div>
              <h2>Employees</h2>

              <p>
                Manage your employees here.
              </p>
            </div>

            <button
              onClick={() =>
                setShowForm(true)
              }
            >
              + Add Employee
            </button>
          </div>

          {showForm && (
            <div className="employee-form">
              <h2>
                Add New Employee
              </h2>

              <form
                onSubmit={addEmployee}
              >
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
                  value={
                    employee.department
                  }
                  onChange={handleChange}
                >
                  <option value="">
                    Select Department
                  </option>

                  <option value="HR">
                    HR
                  </option>

                  <option value="Engineering">
                    Engineering
                  </option>

                  <option value="Finance">
                    Finance
                  </option>

                  <option value="Marketing">
                    Marketing
                  </option>
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
                    onClick={() => {
                      setShowForm(false)

                      setEmployee({
                        name: '',
                        email: '',
                        department: '',
                        role: '',
                      })
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <h3>
                Loading employees...
              </h3>
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <h3>
                No employees yet
              </h3>

              <p>
                Click "Add Employee" to add
                your first employee.
              </p>
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
                  {employees.map(
                    (emp) => (
                      <tr key={emp.id}>
                        <td>
                          {emp.name}
                        </td>

                        <td>
                          {emp.email}
                        </td>

                        <td>
                          {emp.department}
                        </td>

                        <td>
                          {emp.role}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section
          id="attendance"
          className="attendance-section"
        >
          <div className="section-header">
            <div>
              <h2>QR Attendance</h2>

              <p>
                Verify QR code and location
                to record attendance.
              </p>
            </div>
          </div>

          <div className="qr-attendance-card">
            <div className="qr-placeholder">
              <div className="qr-icon">
                ▣
              </div>

              <p>QR Scanner</p>

              <span>
                Scan the company attendance
                QR code
              </span>
            </div>

            <div className="attendance-status">
              <div className="status-item">
                <span>QR Status</span>

                <strong>
                  {qrStatus}
                </strong>
              </div>

              <div className="status-item">
                <span>
                  Location Status
                </span>

                <strong>
                  {locationStatus}
                </strong>
              </div>

              <div className="status-item">
                <span>
                  Blockchain Status
                </span>

                <strong>
                  {blockchainStatus}
                </strong>
              </div>

              <div className="status-item">
                <span>
                  Attendance Status
                </span>

                <strong>
                  {attendanceStatus}
                </strong>
              </div>
            </div>

            <div className="attendance-buttons">
              <button
                className="checkin-btn"
                onClick={startCheckIn}
                disabled={
                  isCheckedIn ||
                  attendanceLoading
                }
              >
                {attendanceLoading
                  ? 'Processing...'
                  : isCheckedIn
                    ? 'Checked In'
                    : 'Start QR Check-In'}
              </button>

              <button
                className="checkout-btn"
                onClick={checkOut}
                disabled={
                  attendanceLoading ||
                  !isCheckedIn
                }
              >
                {attendanceLoading
                  ? 'Processing...'
                  : 'Check Out'}
              </button>
            </div>
          </div>
        </section>

        <section
          id="leave"
          className="leave-section"
        >
          <div className="section-header">
            <div>
              <h2>
                Leave Management
              </h2>

              <p>
                Review and manage employee
                leave requests.
              </p>
            </div>
          </div>

          <div className="leave-management-card">
            <h3>
              Pending Leave Requests
            </h3>

            {leaveRequests.filter(
              (request) =>
                request.status === 'Pending'
            ).length === 0 ? (
              <div className="empty-state">
                <h3>
                  No pending leave requests
                </h3>

                <p>
                  All employee leave requests
                  have been reviewed.
                </p>
              </div>
            ) : (
              <div className="leave-table">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaveRequests
                      .filter(
                        (request) =>
                          request.status ===
                          'Pending'
                      )
                      .map(
                        (request) => (
                          <tr
                            key={request.id}
                          >
                            <td>
                              {request.employee}
                            </td>

                            <td>
                              {request.department}
                            </td>

                            <td>
                              {request.leaveType}
                            </td>

                            <td>
                              {request.from}
                            </td>

                            <td>
                              {request.to}
                            </td>

                            <td>
                              {request.reason}
                            </td>

                            <td>
                              <span className="pending-status">
                                Pending
                              </span>
                            </td>

                            <td>
                              <button
                                className="approve-btn"
                                onClick={() =>
                                  approveLeave(
                                    request.id
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="reject-btn"
                                onClick={() =>
                                  rejectLeave(
                                    request.id
                                  )
                                }
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="leave-management-card">
            <h3>
              Leave Request History
            </h3>

            {leaveRequests.length === 0 ? (
              <div className="empty-state">
                <h3>
                  No leave requests
                </h3>
              </div>
            ) : (
              <div className="leave-table">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaveRequests.map(
                      (request) => (
                        <tr
                          key={request.id}
                        >
                          <td>
                            {request.employee}
                          </td>

                          <td>
                            {request.leaveType}
                          </td>

                          <td>
                            {request.from}
                          </td>

                          <td>
                            {request.to}
                          </td>

                          <td>
                            <strong>
                              {request.status}
                            </strong>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App