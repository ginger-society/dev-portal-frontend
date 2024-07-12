import { useState, useEffect, useContext } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  DocumentData,
  query,
  where,
  doc,
} from "firebase/firestore";
import { db } from "@/shared/firebase";

import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/shared/AuthContext";

import styles from "./listview.module.scss";
import HeaderContainer from "@/components/atoms/HeaderContainer";
import {
  Button,
  ButtonType,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  ModalSize,
  Text,
  TextArea,
  TextSize,
  LoadingPage,
} from "@ginger-society/ginger-ui";
import { FaPencilAlt } from "react-icons/fa";

interface Document {
  id: string;
  name: string;
  description: string;
  userId: string;
}

export const DocumentsList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchTxt, setSearchTxt] = useState<string>("");

  const fetchSchemas = async () => {
    if (!user) {
      return;
    }
    try {
      const userId = user.uid;
      const collectionRef = collection(db, "databaseSchema");
      const queryConstraints = [where("userId", "==", userId)];

      if (searchTxt) {
        // queryConstraints.push(where("name", "==", searchTxt));
        // Or use this for partial matches:
        queryConstraints.push(
          where("name", ">=", searchTxt),
          where("name", "<=", searchTxt + "\uf8ff")
        );
      }

      const querySnapshot = await getDocs(
        query(collectionRef, ...queryConstraints)
      );
      const docs: Document[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name || "",
          description: data.description || "",
          userId: data.userId || "",
        };
      });
      setDocuments(docs);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching documents: ", err);
    }
  };

  useEffect(() => {
    fetchSchemas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchTxt]);

  const insertOrUpdateDocument = async () => {
    if (!user) return;
    const userId = user.uid;
    try {
      if (!userId) throw new Error("User not authenticated");

      if (editingDocId) {
        // Update existing document
        const docRef = doc(db, "databaseSchema", editingDocId);
        await updateDoc(docRef, { name, description });

        // Update local state
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === editingDocId ? { ...doc, name, description } : doc
          )
        );
      } else {
        // Insert new document
        const docData: Omit<Document, "id"> = {
          name,
          description,
          userId,
        };
        await addDoc(collection(db, "databaseSchema"), docData);

        // Fetch documents again to update the list
        const querySnapshot = await getDocs(
          query(collection(db, "databaseSchema"), where("userId", "==", userId))
        );
        const docs: Document[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            name: data.name || "",
            description: data.description || "",
            userId: data.userId || "",
          };
        });
        setDocuments(docs);
      }

      // Reset form
      setName("");
      setDescription("");
      setEditingDocId(null);
      setDialogOpen(false); // Close dialog
    } catch (err: any) {
      console.error("Error adding or updating document: ", err);
    }
  };

  const handleEdit = (doc: Document) => {
    setName(doc.name);
    setDescription(doc.description);
    setEditingDocId(doc.id);
    setDialogOpen(true); // Open dialog for editing
  };

  const openDesigner = (doc: Document) => {
    console.log(doc);
    navigate(`/editor/${doc.id}/${doc.name}`);
  };

  return (
    <div className={styles["container"]}>
      <HeaderContainer />
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="schema-list">
          <div className="list-hedaer-actions-panel">
            <Button
              fullWidth
              onClick={() => {
                setName("");
                setDescription("");
                setEditingDocId(null);
                setDialogOpen(true);
              }}
              type={ButtonType.Primary}
              label="Create Schema"
            />

            <Input
              placeholder="Search..."
              onChange={({ target: { value } }) => {
                setSearchTxt(value);
              }}
              value={searchTxt}
            />
          </div>

          <ul className="schema-list-container">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="card schema-item"
                onClick={() => openDesigner(doc)}
              >
                <div className="schema-item-container">
                  <span
                    className="edit-cta"
                    onClick={(e) => {
                      handleEdit(doc);
                      e.stopPropagation();
                    }}
                  >
                    <FaPencilAlt />
                  </span>
                  <div className="schema-item">
                    <Text size={TextSize.Large}>{doc.name}</Text>
                    <Text tag="p">{doc.description}</Text>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        size={ModalSize.Large}
      >
        <ModalHeader>Create new schema</ModalHeader>
        <ModalBody>
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="btn-group">
            <Button
              label={editingDocId ? "Update" : "Create"}
              type={ButtonType.Primary}
              onClick={insertOrUpdateDocument}
            />
            <Button onClick={() => setDialogOpen(false)} label="Cancel" />
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};
