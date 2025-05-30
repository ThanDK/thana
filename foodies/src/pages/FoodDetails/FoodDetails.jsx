// Import necessary modules and components
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFoodDetails } from '../../service/foodService';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';

// Component to display detailed information about a specific food item
// and allow users to add it to their cart or adjust its quantity.
const FoodDetails = () => {
    // --- Component State and Context ---
    // Retrieve the 'id' from URL parameters to identify the food item.
    const {id} = useParams();
    // 'data' state to store the fetched details of the food item.
    const [data, setData] = useState({});
    const { increaseQty, decreaseQty, quantities } = useContext(StoreContext);
    const navigate = useNavigate();

    useEffect(() => {
        const loadFoodDetails = async () => {
            if (id) { 
                try {
                    const foodData = await fetchFoodDetails(id);
                    setData(foodData); 
                } catch (error) {
                    console.error("Error fetching food details:", error);
                    toast.error('Error displaying the food details.');
                }
            }
        };
        loadFoodDetails();}, [id]); // Re-run effect if 'id' changes
    
    const addToCart = () => {
        increaseQty(data.id);
        navigate("/cart");
    } 
    // --- Cart Interaction Logic ---
    // Determine the current quantity of this food item in the cart.
    // Defaults to 0 if the item isn't in the 'quantities' object (i.e., not in cart).
    const currentQuantity = quantities && quantities[id] ? quantities[id] : 0;

    // --- Render JSX ---
    // The main structure of the food details page, using Bootstrap for layout.
    return (
        <section className="py-5">
        <div className="container px-4 px-lg-5 my-5">
            <div className="row gx-4 gx-lg-5 align-items-center">

                    {/* Food Item Image Display */}
                    <div className="col-md-6">
                        <img
                            className="card-img-top mb-5 mb-md-0"
                            src={data.imageUrl || 'https://dummyimage.com/600x700/dee2e6/6c757d.jpg'}
                            alt={data.name || 'Food item image'}
                        />
                    </div>

                    {/* Food Item Information and Cart Actions */}
                    <div className="col-md-6">
                        <div className="fs-5">Category: <span className='badge text-bg-warning'>{data.category}</span></div>
                        <h1 className="display-5 fw-bolder">{data.name}</h1>
                        <div className="fs-5 mb-2">
                            <span>฿{data.price ? Number(data.price).toFixed(2) : 'N/A'}</span>
                        </div>
                        <p className="lead">{data.description}</p>

                        {/* Cart Controls: Conditionally renders "Add to Cart" button or quantity adjusters */}
                        <div className="d-flex align-items-center">
                                <button className="btn btn-outline-dark flex-shrink-0" type="button" onClick={addToCart}>
                                    <i className="bi-cart-fill me-1"></i>
                                    Add to cart
                                </button>
  
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Export the FoodDetails component for use elsewhere in the application
export default FoodDetails;