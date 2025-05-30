import React from 'react';
import { Link } from 'react-router-dom';
import "./Register.css";
const Register = () => {
  return (
      <div className="register-container">
        <div className="row">
          <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
            <div className="card border-0 shadow rounded-3 my-5">
              <div className="card-body p-4 p-sm-5">
                <h5 className="card-title text-center mb-5 fw-light fs-5">Sign up</h5>
                <form>
                  <div className="form-floating mb-3">
                    <input type="email" className="form-control" id="floatingInput" placeholder="John Doe" />
                    <label htmlFor="floatingInput">Email address</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
                    <label htmlFor="floatingPassword">Password</label>
                  </div>

                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" value="" id="rememberPasswordCheck" />
                    <label className="form-check-label" htmlFor="rememberPasswordCheck">
                      Remember password
                    </label>
                  </div>
                  <div className="d-grid">
                    <button className="btn btn-outline-primary btn-login text-uppercase" type="submit">
                      Sign up
                    </button>
                  </div>
                  <div className="d-grid mt-2">
                    <button className="btn btn-outline-danger btn-reset text-uppercase" type="reset">
                      Reset
                    </button>
                  </div>
                  <div className="mt-4">
                    Already have an account? <Link to="/login">Sign in</Link>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Register;