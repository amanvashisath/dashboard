import { useEffect, useState } from 'react'
import { ArrowLeft, Badge, BriefcaseBusiness, Building2, ClipboardList, LayoutDashboard, LogOut, Search, Sparkles, UserRound, Users, X } from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const fallbackStats = { employees: 3, candidates: 3, jobs: 12, applications: 3 }
const fallbackEmployees = [
  { id: 1, first_name: 'Aarav', last_name: 'Sharma', employee_code: 'EMP-024', designation_name: 'Product Designer', department_name: 'Design', joining_date: '2024-02-18' },
  { id: 2, first_name: 'Mia', last_name: 'Chen', employee_code: 'EMP-023', designation_name: 'Frontend Engineer', department_name: 'Engineering', joining_date: '2024-01-09' },
  { id: 3, first_name: 'Noah', last_name: 'Williams', employee_code: 'EMP-022', designation_name: 'Talent Partner', department_name: 'People', joining_date: '2023-11-12' },
  { id: 4, first_name: 'Sofia', last_name: 'Patel', employee_code: 'EMP-021', designation_name: 'Finance Analyst', department_name: 'Finance', joining_date: '2023-09-26' },
]

async function getData(path, fallback) {
  try {
    const response = await fetch(`${API_URL}${path}`)
    if (!response.ok) throw new Error('Request failed')
    return await response.json()
  } catch {
    return fallback
  }
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('staffly_user') || 'null'))
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [activeView, setActiveView] = useState('Overview')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [stats, setStats] = useState(fallbackStats)
  const [employees, setEmployees] = useState(fallbackEmployees)
  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [query, setQuery] = useState('')
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false)
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [masterModal, setMasterModal] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState('')
  const [deletingRecordId, setDeletingRecordId] = useState(null)
  const [formError, setFormError] = useState('')
  const [employeeForm, setEmployeeForm] = useState({ employee_code: '', first_name: '', last_name: '', email: '', phone: '', gender: '', department_id: '', designation_id: '', joining_date: '', salary: '', employment_status: 'active', address: '' })
  const [candidateForm, setCandidateForm] = useState({ first_name: '', last_name: '', email: '', phone: '', resume_url: '', skills: '', experience_years: '', education: '', address: '' })
  const [jobForm, setJobForm] = useState({ job_title: '', description: '', requirements: '', salary_min: '', salary_max: '', location: '', employment_type: 'Full-time', closing_date: '' })
  const [masterForm, setMasterForm] = useState({ name: '', description: '' })
  const [applicationForm, setApplicationForm] = useState({ candidate_id: '', job_id: '', status: 'applied', notes: '' })
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    getData('/dashboard/stats', fallbackStats).then((data) => setStats({ employees: data.total_employees ?? data.employees ?? fallbackStats.employees, candidates: data.total_candidates ?? data.candidates ?? fallbackStats.candidates, jobs: data.total_jobs ?? data.jobs ?? fallbackStats.jobs, applications: data.total_applications ?? data.applications ?? fallbackStats.applications }))
    getData('/employees', fallbackEmployees).then((data) => setEmployees(Array.isArray(data) ? data : fallbackEmployees))
    getData('/candidates', []).then((data) => setCandidates(Array.isArray(data) ? data : []))
    getData('/jobs', []).then((data) => setJobs(Array.isArray(data) ? data : []))
    getData('/departments', []).then((data) => setDepartments(Array.isArray(data) ? data : []))
    getData('/designations', []).then((data) => setDesignations(Array.isArray(data) ? data : []))
    getData('/applications', []).then((data) => setApplications(Array.isArray(data) ? data : []))
  }, [])

  const visibleEmployees = employees.filter((employee) => `${employee.first_name || ''} ${employee.last_name || ''} ${employee.designation_name || ''} ${employee.department_name || ''}`.toLowerCase().includes(query.toLowerCase()))
  const navigation = [{ name: 'Overview', icon: LayoutDashboard }, { name: 'Employees', icon: Users }, { name: 'Candidates', icon: UserRound }, { name: 'Applicants', icon: ClipboardList }, { name: 'Jobs', icon: BriefcaseBusiness }, { name: 'Departments', icon: Building2 }, { name: 'Designations', icon: Badge }]

  function openEmployeeModal() {
    setFormError('')
    setIsEmployeeFormOpen(true)
  }

  function openCandidateModal() { setFormError(''); setIsCandidateModalOpen(true) }
  function openJobModal() { setFormError(''); setIsJobModalOpen(true) }
  function openApplicationModal() { setFormError(''); setIsApplicationModalOpen(true) }
  function openMasterModal(type) { setFormError(''); setMasterForm({ name: '', description: '' }); setMasterModal(type) }

  function updateEmployeeForm(event) {
    setEmployeeForm({ ...employeeForm, [event.target.name]: event.target.value })
  }

  async function saveEmployee(event) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)
    try {
      const response = await fetch(`${API_URL}/employees`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...employeeForm, department_id: employeeForm.department_id ? Number(employeeForm.department_id) : null, designation_id: employeeForm.designation_id ? Number(employeeForm.designation_id) : null, salary: employeeForm.salary ? Number(employeeForm.salary) : null, employment_status: employeeForm.employment_status }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.message || 'Unable to add employee')
      const refreshedEmployees = await getData('/employees', employees)
      setEmployees(Array.isArray(refreshedEmployees) ? refreshedEmployees : employees)
      setIsEmployeeModalOpen(false)
      setIsEmployeeFormOpen(false)
      setEmployeeForm({ employee_code: '', first_name: '', last_name: '', email: '', phone: '', gender: '', department_id: '', designation_id: '', joining_date: '', salary: '', employment_status: 'active', address: '' })
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function removeRecord() {
    const collections = { Employees: employees, Candidates: candidates, Applicants: applications, Jobs: jobs, Departments: departments, Designations: designations }
    const paths = { Employees: 'employees', Candidates: 'candidates', Applicants: 'applications', Jobs: 'jobs', Departments: 'departments', Designations: 'designations' }
    const records = collections[activeView] || []
    const record = records.find((item) => String(item.id) === selectedRecordId)
    if (!record || !window.confirm(`Remove this ${activeView.toLowerCase().slice(0, -1)}?`)) return
    setDeletingRecordId(record.id)
    try {
      const response = await fetch(`${API_URL}/${paths[activeView]}/${record.id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.message || `Unable to remove ${activeView.toLowerCase().slice(0, -1)}`)
      const refreshed = await getData(`/${paths[activeView]}`, records)
      const nextRecords = Array.isArray(refreshed) ? refreshed : records.filter((item) => item.id !== record.id)
      if (activeView === 'Employees') setEmployees(nextRecords)
      if (activeView === 'Candidates') setCandidates(nextRecords)
      if (activeView === 'Applicants') setApplications(nextRecords)
      if (activeView === 'Jobs') setJobs(nextRecords)
      if (activeView === 'Departments') setDepartments(nextRecords)
      if (activeView === 'Designations') setDesignations(nextRecords)
      setSelectedRecordId('')
    } catch (error) {
      window.alert(error.message)
    } finally {
      setDeletingRecordId(null)
    }
  }

  async function saveRecord(event, type) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)
    const isCandidate = type === 'candidate'
    const form = isCandidate ? candidateForm : jobForm
    const payload = { ...form }
    if (isCandidate) payload.experience_years = form.experience_years ? Number(form.experience_years) : 0
    if (!isCandidate) {
      payload.salary_min = form.salary_min ? Number(form.salary_min) : null
      payload.salary_max = form.salary_max ? Number(form.salary_max) : null
    }
    try {
      const response = await fetch(`${API_URL}/${isCandidate ? 'candidates' : 'jobs'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.message || `Unable to add ${type}`)
      const refreshed = await getData(`/${isCandidate ? 'candidates' : 'jobs'}`, [])
      if (isCandidate) { setCandidates(Array.isArray(refreshed) ? refreshed : candidates); setIsCandidateModalOpen(false); setCandidateForm({ first_name: '', last_name: '', email: '', phone: '', resume_url: '', skills: '', experience_years: '', education: '', address: '' }) }
      else { setJobs(Array.isArray(refreshed) ? refreshed : jobs); setIsJobModalOpen(false); setJobForm({ job_title: '', description: '', requirements: '', salary_min: '', salary_max: '', location: '', employment_type: 'Full-time', closing_date: '' }) }
    } catch (error) { setFormError(error.message) } finally { setIsSaving(false) }
  }

  async function saveMaster(event) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)
    try {
      const response = await fetch(`${API_URL}/${masterModal}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(masterForm) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.message || `Unable to add ${masterModal.slice(0, -1)}`)
      const refreshed = await getData(`/${masterModal}`, [])
      if (masterModal === 'departments') setDepartments(Array.isArray(refreshed) ? refreshed : departments)
      else setDesignations(Array.isArray(refreshed) ? refreshed : designations)
      setMasterModal('')
    } catch (error) { setFormError(error.message) } finally { setIsSaving(false) }
  }

  async function saveApplication(event) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)
    try {
      const response = await fetch(`${API_URL}/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...applicationForm, candidate_id: Number(applicationForm.candidate_id), job_id: Number(applicationForm.job_id) }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.message || 'Unable to add applicant')
      const refreshed = await getData('/applications', applications)
      setApplications(Array.isArray(refreshed) ? refreshed : applications)
      setIsApplicationModalOpen(false)
      setApplicationForm({ candidate_id: '', job_id: '', status: 'applied', notes: '' })
    } catch (error) { setFormError(error.message) } finally { setIsSaving(false) }
  }

  async function searchRecords(event) {
    const value = event.target.value
    setQuery(value)
    if (!value.trim()) { setSearchResults(null); return }
    setIsSearching(true)
    const results = await getData(`/search?q=${encodeURIComponent(value)}&type=all`, null)
    setSearchResults(results)
    setIsSearching(false)
  }

  async function login(event) {
    event.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)
    try {
      const response = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Invalid email or password')
      localStorage.setItem('staffly_token', result.token)
      localStorage.setItem('staffly_user', JSON.stringify(result.user))
      setUser(result.user)
    } catch (error) { setLoginError(error.message) } finally { setIsLoggingIn(false) }
  }

  function logout() { localStorage.removeItem('staffly_token'); localStorage.removeItem('staffly_user'); setUser(null) }

  if (!user) return <div className="login-page"><form className="login-card" onSubmit={login}><div className="brand login-brand"><span className="brand-mark">S</span><span>Staffly</span></div><p className="eyebrow">PEOPLE OPERATIONS</p><h1>Welcome back</h1><p className="subhead">Sign in to manage your workspace.</p><label>Email<input type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} placeholder="you@company.com" required /></label><label>Password<input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} placeholder="Your password" required /></label>{loginError && <p className="form-error">{loginError}</p>}<button className="primary-button login-button" disabled={isLoggingIn}>{isLoggingIn ? 'Signing in...' : 'Sign in'}</button></form></div>

  return (
    <div className="app-shell">
      <aside className={isSidebarCollapsed ? 'sidebar collapsed' : 'sidebar'}>
        <button className="brand brand-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title="Expand or collapse sidebar" aria-label="Expand or collapse BPL Admin sidebar"><span className="brand-mark">B</span><span>BPL Admin</span></button>
        <div className="workspace-label">WORKSPACE</div>
        <nav>{navigation.map(({ name, icon: Icon }) => <button className={activeView === name ? 'nav-item active' : 'nav-item'} onClick={() => setActiveView(name)} key={name}><Icon size={17} strokeWidth={1.8} />{name}</button>)}</nav>
        <div className="sidebar-bottom" />
      </aside>
      <main className="main-content">
        <header className="topbar"><button className="back-button" onClick={() => setActiveView('Overview')} disabled={activeView === 'Overview'}><ArrowLeft size={15} /> Back</button><nav className="top-navigation">{navigation.map(({ name, icon: Icon }) => <button className={activeView === name ? 'top-nav-item active' : 'top-nav-item'} onClick={() => setActiveView(name)} key={name}><Icon size={14} strokeWidth={1.9} />{name}</button>)}</nav><div className="top-actions"><label className="global-search"><Search size={15} /><input value={query} onChange={searchRecords} placeholder="Search workspace" /></label><button className="top-logout" onClick={logout}><LogOut size={15} /> Logout</button></div></header>
        {query && searchResults && <div className="search-results"><strong>{isSearching ? 'Searching...' : 'Search results'}</strong>{searchResults.employees?.slice(0, 3).map((item) => <button key={`employee-${item.id}`} onClick={() => { setActiveView('Employees'); setQuery('') }}><span className="search-type">Employee</span>{item.name}</button>)}{searchResults.candidates?.slice(0, 3).map((item) => <button key={`candidate-${item.id}`} onClick={() => { setActiveView('Candidates'); setQuery('') }}><span className="search-type">Candidate</span>{item.name}</button>)}{searchResults.jobs?.slice(0, 3).map((item) => <button key={`job-${item.id}`} onClick={() => { setActiveView('Jobs'); setQuery('') }}><span className="search-type">Job</span>{item.job_title}</button>)}</div>}
        <div className="content-wrap">
          {activeView === 'Overview' && <section className="welcome"><div><p className="eyebrow">THURSDAY, SEPTEMBER 11, 2026</p><h1>Hello, Admin <span>✦</span></h1><p className="subhead">Here is what is happening across your people operations.</p></div><button className="primary-button" onClick={openEmployeeModal}>＋ Add employee</button></section>}
          {activeView === 'Overview' ? <>
            <section className="stat-grid">{[['Total employees', stats.employees, 'active'], ['Open positions', stats.jobs, 'orange'], ['Candidates', stats.candidates, 'blue'], ['Applications', stats.applications, 'purple']].map(([label, value, color]) => <div className="stat-card" key={label}><div className={`stat-icon ${color}`}>{label[0]}</div><p>{label}</p><strong>{value}</strong></div>)}</section>
            <section className="home-summary"><div className="panel summary-panel"><div className="panel-heading"><div><h2>Hiring at a glance</h2><p>A simple view of your current hiring pipeline.</p></div><ClipboardList size={20} color="var(--green)" /></div><div className="summary-list"><div><span className="summary-dot coral" /><strong>{stats.jobs} open positions</strong><small>Roles ready for applicants</small></div><div><span className="summary-dot blue" /><strong>{stats.candidates} candidates</strong><small>People in your talent pool</small></div><div><span className="summary-dot green" /><strong>{stats.applications} applications</strong><small>Applications to review</small></div></div></div><div className="panel next-panel"><div className="panel-heading"><div><h2>Next steps</h2><p>Keep your workspace moving.</p></div><Sparkles size={20} color="var(--green)" /></div><button className="next-step" onClick={openCandidateModal}><UserRound size={16} /> Add a candidate <span>→</span></button><button className="next-step" onClick={openJobModal}><BriefcaseBusiness size={16} /> Post a new job <span>→</span></button><button className="next-step" onClick={() => setActiveView('Applicants')}><ClipboardList size={16} /> Review applicants <span>→</span></button></div></section>
          </> : <section className="panel records-panel"><div className="panel-heading"><div><h2>{activeView}</h2><p>Manage your {activeView.toLowerCase()} records.</p></div>{activeView === 'Employees' && <button className="primary-button" onClick={openEmployeeModal}>＋ Add employee</button>}{activeView === 'Candidates' && <button className="primary-button" onClick={openCandidateModal}>＋ Add candidate</button>}{activeView === 'Applicants' && <button className="primary-button" onClick={openApplicationModal}>＋ Add applicant</button>}{activeView === 'Jobs' && <button className="primary-button" onClick={openJobModal}>＋ Add job</button>}{activeView === 'Departments' && <button className="primary-button" onClick={() => openMasterModal('departments')}>＋ Add department</button>}{activeView === 'Designations' && <button className="primary-button" onClick={() => openMasterModal('designations')}>＋ Add designation</button>}</div><div className="table-tools"><label>⌕<input placeholder={`Search ${activeView.toLowerCase()}...`} value={query} onChange={(event) => setQuery(event.target.value)} /></label><button className="filter-button">☷ Filters</button></div><div className="table-wrap"><table><thead><tr><th>{activeView === 'Employees' ? 'EMPLOYEE' : activeView === 'Candidates' ? 'CANDIDATE' : activeView === 'Applicants' ? 'APPLICANT' : activeView === 'Jobs' ? 'JOB TITLE' : 'NAME'}</th><th>DETAIL</th><th>DATE ADDED</th><th>STATUS</th></tr></thead><tbody>{activeView === 'Employees' ? visibleEmployees.map((employee) => <tr key={employee.id}><td><div className="person"><div className="avatar pastel">{`${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`}</div><div><strong>{employee.first_name} {employee.last_name}</strong><small>{employee.employee_code}</small></div></div></td><td>{employee.designation_name || 'Team member'}</td><td>{employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}</td><td><span className="status">Active</span></td></tr>) : activeView === 'Candidates' ? candidates.filter((candidate) => `${candidate.first_name || ''} ${candidate.last_name || ''} ${candidate.email || ''}`.toLowerCase().includes(query.toLowerCase())).map((candidate) => <tr key={candidate.id}><td><div className="person"><div className="avatar pastel">{`${candidate.first_name?.[0] || ''}${candidate.last_name?.[0] || ''}`}</div><div><strong>{candidate.first_name} {candidate.last_name}</strong><small>{candidate.email}</small></div></div></td><td>{candidate.skills || 'Candidate'}</td><td>{candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'Recently'}</td><td><span className="status">New</span></td></tr>) : activeView === 'Applicants' ? applications.filter((application) => `${application.candidate_name || ''} ${application.job_title || ''}`.toLowerCase().includes(query.toLowerCase())).map((application) => <tr key={application.id}><td><strong>{application.candidate_name}</strong><small>{application.candidate_email}</small></td><td>{application.job_title}</td><td>{application.created_at ? new Date(application.created_at).toLocaleDateString() : 'Recently'}</td><td><span className="status">{application.status || 'Applied'}</span></td></tr>) : activeView === 'Jobs' ? jobs.filter((job) => `${job.job_title || ''} ${job.location || ''}`.toLowerCase().includes(query.toLowerCase())).map((job) => <tr key={job.id}><td><strong>{job.job_title}</strong></td><td>{job.employment_type || 'Full-time'}</td><td>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}</td><td><span className="status">Open</span></td></tr>) : (activeView === 'Departments' ? departments : designations).filter((item) => `${item.name || ''} ${item.description || ''}`.toLowerCase().includes(query.toLowerCase())).map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.description || 'No description'}</td><td>Existing</td><td><span className="status">Active</span></td></tr>)}</tbody></table></div></section>}
        </div>
      </main>
      {isEmployeeFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsEmployeeFormOpen(false)}><form className="modal" onSubmit={saveEmployee}><div className="modal-heading"><div><p className="eyebrow">NEW RECORD</p><h2>Add employee</h2></div><button type="button" className="close-button" onClick={() => setIsEmployeeFormOpen(false)} aria-label="Close"><X size={18} /></button></div><div className="form-grid"><label>Employee code<input name="employee_code" value={employeeForm.employee_code} onChange={updateEmployeeForm} placeholder="EMP-025" required /></label><label>First name<input name="first_name" value={employeeForm.first_name} onChange={updateEmployeeForm} placeholder="First name" required /></label><label>Last name<input name="last_name" value={employeeForm.last_name} onChange={updateEmployeeForm} placeholder="Last name" required /></label><label>Email<input type="email" name="email" value={employeeForm.email} onChange={updateEmployeeForm} placeholder="name@company.com" required /></label><label>Department<select name="department_id" value={employeeForm.department_id} onChange={updateEmployeeForm}><option value="">Select department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label>Designation<select name="designation_id" value={employeeForm.designation_id} onChange={updateEmployeeForm}><option value="">Select designation</option>{designations.map((designation) => <option key={designation.id} value={designation.id}>{designation.name}</option>)}</select></label><label>Phone<input name="phone" value={employeeForm.phone} onChange={updateEmployeeForm} placeholder="Phone number" /></label><label>Status<select name="employment_status" value={employeeForm.employment_status} onChange={updateEmployeeForm}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label>Joining date<input type="date" name="joining_date" value={employeeForm.joining_date} onChange={updateEmployeeForm} required /></label><label>Salary<input type="number" name="salary" value={employeeForm.salary} onChange={updateEmployeeForm} placeholder="Annual salary" min="0" /></label><label className="full-field">Address<textarea name="address" value={employeeForm.address} onChange={updateEmployeeForm} placeholder="Home address" rows="3" /></label></div>{formError && <p className="form-error">{formError}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setIsEmployeeFormOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save employee'}</button></div></form></div>}
      {activeView !== 'Overview' && <div className="employee-remove-bar"><span className="after-status-label">Remove {activeView.slice(0, -1).toLowerCase()}</span><select value={selectedRecordId} onChange={(event) => setSelectedRecordId(event.target.value)}><option value="">Select record</option>{(activeView === 'Employees' ? employees : activeView === 'Candidates' ? candidates : activeView === 'Applicants' ? applications : activeView === 'Jobs' ? jobs : activeView === 'Departments' ? departments : designations).map((record) => <option key={record.id} value={record.id}>{record.candidate_name ? `${record.candidate_name}${record.job_title ? ` - ${record.job_title}` : ''}` : record.first_name ? `${record.first_name} ${record.last_name || ''}` : record.job_title || record.name || `Application #${record.id}`}</option>)}</select><button className="remove-button" onClick={removeRecord} disabled={!selectedRecordId || deletingRecordId}>Remove</button></div>}
      {activeView === 'Employees' && <div className="employee-meta-bar"><strong>New employee details</strong><select name="department_id" value={employeeForm.department_id} onChange={updateEmployeeForm}><option value="">Department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select><select name="designation_id" value={employeeForm.designation_id} onChange={updateEmployeeForm}><option value="">Designation</option>{designations.map((designation) => <option key={designation.id} value={designation.id}>{designation.name}</option>)}</select><select name="employment_status" value={employeeForm.employment_status} onChange={updateEmployeeForm}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>}
      {isEmployeeModalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsEmployeeModalOpen(false)}><form className="modal" onSubmit={saveEmployee}><div className="modal-heading"><div><p className="eyebrow">NEW RECORD</p><h2>Add employee</h2></div><button type="button" className="close-button" onClick={() => setIsEmployeeModalOpen(false)} aria-label="Close">×</button></div><div className="form-grid"><label>Employee code<input name="employee_code" value={employeeForm.employee_code} onChange={updateEmployeeForm} placeholder="EMP-025" required /></label><label>First name<input name="first_name" value={employeeForm.first_name} onChange={updateEmployeeForm} placeholder="First name" required /></label><label>Last name<input name="last_name" value={employeeForm.last_name} onChange={updateEmployeeForm} placeholder="Last name" required /></label><label>Email<input type="email" name="email" value={employeeForm.email} onChange={updateEmployeeForm} placeholder="name@company.com" required /></label><label>Phone<input name="phone" value={employeeForm.phone} onChange={updateEmployeeForm} placeholder="Phone number" /></label><label>Gender<select name="gender" value={employeeForm.gender} onChange={updateEmployeeForm}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><label>Joining date<input type="date" name="joining_date" value={employeeForm.joining_date} onChange={updateEmployeeForm} required /></label><label>Salary<input type="number" name="salary" value={employeeForm.salary} onChange={updateEmployeeForm} placeholder="Annual salary" min="0" /></label><label className="full-field">Address<textarea name="address" value={employeeForm.address} onChange={updateEmployeeForm} placeholder="Home address" rows="3" /></label></div>{formError && <p className="form-error">{formError}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setIsEmployeeModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save employee'}</button></div></form></div>}
      {isCandidateModalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsCandidateModalOpen(false)}><form className="modal" onSubmit={(event) => saveRecord(event, 'candidate')}><div className="modal-heading"><div><p className="eyebrow">NEW RECORD</p><h2>Add candidate</h2></div><button type="button" className="close-button" onClick={() => setIsCandidateModalOpen(false)} aria-label="Close">×</button></div><div className="form-grid"><label>First name<input name="first_name" value={candidateForm.first_name} onChange={(event) => setCandidateForm({ ...candidateForm, first_name: event.target.value })} required /></label><label>Last name<input name="last_name" value={candidateForm.last_name} onChange={(event) => setCandidateForm({ ...candidateForm, last_name: event.target.value })} required /></label><label>Email<input type="email" name="email" value={candidateForm.email} onChange={(event) => setCandidateForm({ ...candidateForm, email: event.target.value })} required /></label><label>Phone<input name="phone" value={candidateForm.phone} onChange={(event) => setCandidateForm({ ...candidateForm, phone: event.target.value })} /></label><label>Skills<input name="skills" value={candidateForm.skills} onChange={(event) => setCandidateForm({ ...candidateForm, skills: event.target.value })} placeholder="React, SQL, leadership" /></label><label>Experience years<input type="number" name="experience_years" min="0" value={candidateForm.experience_years} onChange={(event) => setCandidateForm({ ...candidateForm, experience_years: event.target.value })} /></label><label>Education<input name="education" value={candidateForm.education} onChange={(event) => setCandidateForm({ ...candidateForm, education: event.target.value })} /></label><label>Resume URL<input type="url" name="resume_url" value={candidateForm.resume_url} onChange={(event) => setCandidateForm({ ...candidateForm, resume_url: event.target.value })} /></label><label className="full-field">Address<textarea name="address" rows="3" value={candidateForm.address} onChange={(event) => setCandidateForm({ ...candidateForm, address: event.target.value })} /></label></div>{formError && <p className="form-error">{formError}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setIsCandidateModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save candidate'}</button></div></form></div>}
      {isJobModalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsJobModalOpen(false)}><form className="modal" onSubmit={(event) => saveRecord(event, 'job')}><div className="modal-heading"><div><p className="eyebrow">NEW RECORD</p><h2>Add job</h2></div><button type="button" className="close-button" onClick={() => setIsJobModalOpen(false)} aria-label="Close">×</button></div><div className="form-grid"><label className="full-field">Job title<input name="job_title" value={jobForm.job_title} onChange={(event) => setJobForm({ ...jobForm, job_title: event.target.value })} placeholder="Senior Product Designer" required /></label><label>Location<input name="location" value={jobForm.location} onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })} placeholder="Remote or city" /></label><label>Employment type<select name="employment_type" value={jobForm.employment_type} onChange={(event) => setJobForm({ ...jobForm, employment_type: event.target.value })}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></label><label>Minimum salary<input type="number" name="salary_min" min="0" value={jobForm.salary_min} onChange={(event) => setJobForm({ ...jobForm, salary_min: event.target.value })} /></label><label>Maximum salary<input type="number" name="salary_max" min="0" value={jobForm.salary_max} onChange={(event) => setJobForm({ ...jobForm, salary_max: event.target.value })} /></label><label>Closing date<input type="date" name="closing_date" value={jobForm.closing_date} onChange={(event) => setJobForm({ ...jobForm, closing_date: event.target.value })} /></label><label className="full-field">Description<textarea name="description" rows="3" value={jobForm.description} onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })} /></label><label className="full-field">Requirements<textarea name="requirements" rows="3" value={jobForm.requirements} onChange={(event) => setJobForm({ ...jobForm, requirements: event.target.value })} /></label></div>{formError && <p className="form-error">{formError}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setIsJobModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save job'}</button></div></form></div>}
      {masterModal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setMasterModal('')}><form className="modal compact-modal" onSubmit={saveMaster}><div className="modal-heading"><div><p className="eyebrow">NEW RECORD</p><h2>Add {masterModal === 'departments' ? 'department' : 'designation'}</h2></div><button type="button" className="close-button" onClick={() => setMasterModal('')} aria-label="Close">×</button></div><div className="form-grid"><label className="full-field">Name<input value={masterForm.name} onChange={(event) => setMasterForm({ ...masterForm, name: event.target.value })} placeholder={masterModal === 'departments' ? 'Engineering' : 'Product Manager'} required /></label><label className="full-field">Description<textarea rows="3" value={masterForm.description} onChange={(event) => setMasterForm({ ...masterForm, description: event.target.value })} placeholder="Optional description" /></label></div>{formError && <p className="form-error">{formError}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setMasterModal('')}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button></div></form></div>}
      {isApplicationModalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsApplicationModalOpen(false)}><form className="modal compact-modal" onSubmit={saveApplication}><div className="modal-heading"><div><p className="eyebrow">NEW RECORD</p><h2>Add applicant</h2></div><button type="button" className="close-button" onClick={() => setIsApplicationModalOpen(false)} aria-label="Close">×</button></div><div className="form-grid"><label>Candidate<select value={applicationForm.candidate_id} onChange={(event) => setApplicationForm({ ...applicationForm, candidate_id: event.target.value })} required><option value="">Select candidate</option>{candidates.map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.first_name} {candidate.last_name}</option>)}</select></label><label>Job<select value={applicationForm.job_id} onChange={(event) => setApplicationForm({ ...applicationForm, job_id: event.target.value })} required><option value="">Select job</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.job_title}</option>)}</select></label><label>Status<select value={applicationForm.status} onChange={(event) => setApplicationForm({ ...applicationForm, status: event.target.value })}><option value="applied">Applied</option><option value="screening">Screening</option><option value="interview">Interview</option><option value="offered">Offered</option><option value="rejected">Rejected</option></select></label><label className="full-field">Notes<textarea rows="3" value={applicationForm.notes} onChange={(event) => setApplicationForm({ ...applicationForm, notes: event.target.value })} placeholder="Optional notes" /></label></div>{formError && <p className="form-error">{formError}</p>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setIsApplicationModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving || !candidates.length || !jobs.length}>{isSaving ? 'Saving...' : 'Save applicant'}</button></div>{(!candidates.length || !jobs.length) && <p className="form-error">Add at least one candidate and one job before creating an applicant.</p>}</form></div>}
    </div>
  )
}

export default App
