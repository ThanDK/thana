import { createContext, useEffect, useState } from "react";
import { fetchFoodList, fetchThaiProvinces } from "../service/foodService";
// Correctly import all necessary functions from your cart service
import { addToCart, getCartData, removeQtyFromCart } from "../service/cartService";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
    const [foodList, setFoodList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [token, setToken] = useState("");

  
    const increaseQty = async (foodId) => {
        // Optimistically update the UI first
        setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] || 0) + 1 }));
        // Then, update the backend
        if (token) {
            await addToCart(foodId, token);
        }
    };

    const decreaseQty = async (foodId) => {
        // First, tell the backend to remove one item
        if (token) {
            await removeQtyFromCart(foodId, token);
        }
        // Then, update the local state to match
        setQuantities((prev) => {
            const newQuantities = { ...prev };
            if (newQuantities[foodId] > 1) {
                newQuantities[foodId] -= 1;
            } else {
                // If quantity is 1, it will become 0, so remove the item from the state
                delete newQuantities[foodId];
            }
            return newQuantities;
        });
    };

    // This function is for removing an item completely (e.g., from the cart page)
    // It's good practice to have a separate function for this.
    const removeItemFromCart = async (foodId) => {
        // You would need a backend endpoint for this, e.g., DELETE /api/cart/item/{foodId}
        // For now, we'll just update the local state.
        setQuantities((prevQuantities) => {
            const updatedQuantities = { ...prevQuantities };
            delete updatedQuantities[foodId];
            // Here you would also add: await api.removeAllOfItem(foodId, token);
            return updatedQuantities;
        });
    };

    const loadCartData = async (token) => {
        const items = await getCartData(token);
        setQuantities(items || {}); // Ensure quantities is an object even if items is null/undefined
    }        
    
    const contextValue = {
        foodList,
        increaseQty,
        decreaseQty, 
        quantities,
        removeItemFromCart, // Renamed for clarity
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
                if (localStorage.getItem('token')) {
                    const currentToken = localStorage.getItem("token");
                    setToken(currentToken);
                    await loadCartData(currentToken);
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