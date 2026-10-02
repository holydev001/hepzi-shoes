"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
const useCartStore=create(persist((set)=>({cart:[],add:(product)=>set(s=>{const found=s.cart.find(i=>i.id===product.id);return {cart:found?s.cart.map(i=>i.id===product.id?{...i,quantity:i.quantity+1}:i):[...s.cart,{...product,quantity:1}]}}),remove:(id)=>set(s=>({cart:s.cart.filter(i=>i.id!==id)})),clear:()=>set({cart:[]})}),{name:"hephzi-cart"}));
export default useCartStore;
