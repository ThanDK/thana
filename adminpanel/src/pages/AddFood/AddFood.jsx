import React from 'react';
import {assets} from '../../assets/assets';
const AddFood = () => {
  return (
    <div className="mx-2 mt-2 ">
      <div className="row mt-2">
        <div className="card col-md-4">
          <div className="card-body">
            <h2 className="mb-4">Add Food</h2>
            <form>

              <div className="mb-3">
                <label htmlFor="image" className="form-label">
                  <img src={assets.upload} alt="" width={98}/>
                </label>
                <input type="file" className="form-control" id="image" required hidden/>
              </div>

              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input type="text" className="form-control" id="name" required name='name'/>
              </div>
            
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea className="form-control" id="description" rows="5" required name='description'></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">Categoty</label>
                <select name="category" id="category"className='form-control'>
                  <option value="Biryani">Biryani</option>
                  <option value="Cake">Cake</option>
                  <option value="Burger">Burger</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Salad">Salad</option>
                  <option value="Ice Cream">Ice Cream</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="price" className="form-label">Price</label>
                <input type='number' name='price' id='price' className='form-control'/>
              </div>

              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddFood;