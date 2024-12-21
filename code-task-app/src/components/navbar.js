
import { Link } from "react-router-dom"
function handellogout(){
    localStorage.removeItem("email");
}

export default function Navebar() {
         
        return (
        <nav className=" navbar navbar-expand-lg "xd >
            <div className="container">
                <img src={""} alt="Logo" width={"80px"} style={{ marginRight: "100px" }} />

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" ></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0" >
                        <li className="nav-item " >
                            <Link className="nav-link active items" aria-current="page" href="#" style={{ color: "white", padding: "20px 30px ", fontSize: "25px" }}>Home</Link>
                        </li>
                        <li className="nav-item " >
                            <Link className="nav-link active items" aria-current="page" href="#" style={{ color: "white", padding: "20px 30px ", fontSize: "25px" }}>video</Link>
                        </li>
                        <li className="nav-item " >
                            <Link className="nav-link active items" aria-current="page" href="#" style={{ color: "white", padding: "20px 30px ", fontSize: "25px" }}>chatbot</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link items" href="#" style={{ color: "white", padding: "20px 30px ", fontSize: "25px" }}>About</Link>
                        </li>
                    </ul>
                      
                            <>
                                <Link to="login" className="login" type="button" style={{ backgroundColor: "#ffc107", color: "white", border: "none", padding: "5px 20px", borderRadius: "20px 0px 0px 20px", padding: "10px 30px", textDecoration: "none" }} >Login</Link>
                                <Link to="Register" className="login" type="button" style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 20px", borderRadius: "0px 20px 20px 0px", padding: "10px 30px", textDecoration: "none" }} >Register</Link>
                            </>
                    
                            {/* <Link onClick={handellogout} to="login" className="login" type="button" style={{ backgroundColor: "#ffc107", color: "white", border: "none", padding: "5px 20px", borderRadius: "20px", padding: "10px 30px", textDecoration: "none" }} >Log Out</Link> */}

                        

                </div>
            </div>
        </nav>
    )
}