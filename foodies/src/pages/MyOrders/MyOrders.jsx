import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import './MyOrders.css';

const MyOrders = () => {
    const { token } = useContext(StoreContext);
    const [data, setData] = useState([]);

    const fetchOrders = async () => {
        // A little visual cue for the user that a refresh is happening
        console.log("Refreshing orders..."); 
        try {
            const response = await axios.get("http://localhost:8080/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setData(response.data.data || response.data); 
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    return (
        <div className='my-orders'>
            {/* New header container */}
            <div className="my-orders-header">
                <h2>My Orders</h2>
                <button onClick={fetchOrders} className="refresh-button" title="Refresh Orders">
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>
            
            {data.length === 0 ? (
                <div className="my-orders-container">
                    <p style={{padding: '20px', textAlign: 'center'}}>You have no orders yet.</p>
                </div>
            ) : (
                <div className="my-orders-container">
                    {data.map((order) => (
                        <div key={order._id} className='my-orders-order'>
                            <img src={assets.delivery} alt="Delivery Icon" />
                            <p>
                                {order.orderedItems.map(item => `${item.name} x ${item.quantity}`).join(", ")}
                            </p>
                            <p>฿{order.amount.toFixed(2)}</p>
                            <p>Items: {order.orderedItems.length}</p>
                            <p className='order-status' order-status={order.orderStatus}>{order.orderStatus}</p>
                            <button>More Details</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;