import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isAuth = localStorage.getItem("isAuth") === "true";

  const logout = () => {
    localStorage.removeItem("isAuth");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">SkillPulse</h2>

      <div className="nav-links">
        {isAuth ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/check-in">Check-in</Link>
            <Link to="/analytics">Analytics</Link>
            <button onClick={logout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
