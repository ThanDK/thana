import { createContext, useEffect, useState } from "react";
import { fetchFoodList, fetchThaiProvinces } from "../service/foodService";
import axios from "axios";
import { addToCart, getCartData } from "../service/cartService";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [token, setToken] = useState("");

  
    const increaseQty = async (foodId) => {
        setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
        await addToCart(foodId, token)
    };

    const decreaseQty = async (foodId) => {
        setQuantities((prev) => ({ 
            ...prev, 
            [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0 
        }));
        await removeFromCart(foodId, token);
    };

    const removeFromCart = (foodId) => {
        setQuantities((prevQuantities) => {
            const updateQuantities = { ...prevQuantities };
            delete updateQuantities[foodId];
            return updateQuantities;
        });
    };

    const loadCartData = async (token)=> {
        const items = await getCartData(token);
        setQuantities(items);
    }        
    
    const contextValue = {
        foodList,
        increaseQty,
        decreaseQty, 
        quantities,
        removeFromCart,
        provinces,
        token,
        setToken,
        setQuantities,
        loadCartData
    };

    useEffect(() => {
        async function loadData() {
            try {
                const data = await fetchFoodList();
                setFoodList(data || []); 
                if(localStorage.getItem('token')) {
                    setToken(localStorage.getItem("token"));
                    await loadCartData(localStorage.getItem("token"));
                }
            } catch (error) {
                console.error("Failed to fetch food list:", error);
                setFoodList([]);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        fetchThaiProvinces()
            .then(data => {
                setProvinces(data || []); 
            })
            .catch(error => {
                console.error("Failed to fetch Thai provinces:", error);
                setProvinces([]);
            });
    }, []);

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};