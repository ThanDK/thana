import React from 'react';
import {assets} from '../../assets/assets';
import { useState, useRef } from 'react'; // เพิ่ม useRef
import axios from 'axios';
import { addFood } from '../../service/foodservice';
import { toast } from 'react-toastify';

const AddFood = () => {
    const [image, setImage] = useState(null); // เปลี่ยนจาก false เป็น null
    const fileInputRef = useRef(); // เพิ่ม ref เพื่อรีเซ็ตไฟล์อินพุต
    const [data, setData] = useState({name:'',description:'',price:'',category:'Biryani'});

    const onChangeHandler = (event) => {
      const name = event.target.name; 
      const value = event.target.value;
      setData(data => ({...data, [name]: value}))
    }

    const onSubmitHandler = async (event) => {
      event.preventDefault();
      if(!image) { toast.error('Please Select an image.'); return; }
      try {
        await addFood(data, image);
        toast.success('Food added successfully.');
        setData({name:'',description:'',category:'Biryani',price:''});
        setImage(null); // รีเซ็ต state image
        fileInputRef.current.value = ''; // รีเซ็ต input เพื่อเลือกไฟล์เดิมซ้ำได้
      } catch (error) {
        toast.error('Error adding food.');
      }
    }

  return (
    <div className="mx-2 mt-2 "><div className="row mt-2"><div className="card col-md-4"><div className="card-body"><h2 className="mb-4">Add Food</h2><form onSubmit={onSubmitHandler}>

      <div className="mb-3">
        <label htmlFor="image" className="form-label"><img src={image ? URL.createObjectURL(image) : assets.upload} alt="" width={98}  style={{ cursor: 'pointer' }}/></label>
        <input ref={fileInputRef} type="file" className="form-control" id="image" hidden onChange={(e) => setImage(e.target.files[0])}/> {/* เพิ่ม ref */}
      </div>

      <div className="mb-3">
        <label htmlFor="name" className="form-label">Name</label>
        <input type="text" placeholder='Chicken Biryani' className="form-control" id="name" required name='name' onChange={onChangeHandler} value={data.name}/>
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea className="form-control" placeholder='Write content here...' id="description" rows="5" required name='description' onChange={onChangeHandler} value={data.description}></textarea>
      </div>

      <div className="mb-3">
        <label htmlFor="category" className="form-label">Categoty</label>
        <select name="category" id="category" className='form-control' onChange={onChangeHandler} value={data.category}>
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
        <input type='number' name='price' placeholder='฿200' id='price' className='form-control' onChange={onChangeHandler} value={data.price}/>
      </div>

      <button type="submit" className="btn btn-primary">Save</button>
    </form></div></div></div></div>
  )
}

export default AddFood;
