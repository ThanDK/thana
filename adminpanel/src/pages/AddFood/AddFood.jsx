import React from 'react';

const AddFood = () => {
  return (
    <div className="container ">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="contact-form">
            <h2 className="mb-4">Add Food</h2>
            <form>
              <div className="mb-3">
                <label for="name" className="form-label">Your Name</label>
                <input type="text" className="form-control" id="name" required/>
              </div>
              <div className="mb-3">
                <label for="email" className="form-label">Your Email</label>
                <input type="email" className="form-control" id="email" required/>
              </div>
              <div className="mb-3">
                <label for="message" className="form-label">Your Message</label>
                <textarea className="form-control" id="message" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddFood;