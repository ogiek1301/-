import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, query, orderBy
} from "firebase/firestore";

// ユーザーごとの企業データをFirestoreで管理
export function useCompanies(uid) {
  const [companies, setCompanies] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users", uid, "companies"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setCompanies(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      setLoaded(true);
    });
    return unsub;
  }, [uid]);

  const saveCompany = async (company) => {
    const ref = doc(db, "users", uid, "companies", String(company.id));
    await setDoc(ref, { ...company, updatedAt: Date.now() });
  };

  const deleteCompany = async (id) => {
    await deleteDoc(doc(db, "users", uid, "companies", String(id)));
  };

  return { companies, loaded, saveCompany, deleteCompany };
}

// スタンドアロンイベントも同様に管理
export function useStandaloneEvents(uid) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users", uid, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, snap => {
      setEvents(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return unsub;
  }, [uid]);

  const saveEvent = async (event) => {
    const ref = doc(db, "users", uid, "events", String(event.id));
    await setDoc(ref, event);
  };

  const deleteEvent = async (id) => {
    await deleteDoc(doc(db, "users", uid, "events", String(id)));
  };

  return { events, saveEvent, deleteEvent };
}
