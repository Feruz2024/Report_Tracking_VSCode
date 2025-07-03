import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUsers } from "../utils/api";

const EntityContext = createContext();

export function EntityProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load users");
        setLoading(false);
      });
  }, []);

  return (
    <EntityContext.Provider value={{ users, loading, error }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntities() {
  return useContext(EntityContext);
}
