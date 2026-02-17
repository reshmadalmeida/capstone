import { useEffect, useMemo, useState } from "react";
import ReinsurerForm from "./ReinsurerForm";
import ConfirmDialog from "../../shared/ConfirmDialog";
import { useAuth } from "../../hooks/useAuth";
import { isAllowed } from "../../common/utils";

import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

// ✅ Dummy data
const DUMMY_REINSURERS = [
  {
    _id: "r1",
    name: "Swiss Re",
    code: "R001",
    country: "Switzerland",
    rating: "AAA",
    contactEmail: "contact@swissre.com",
    status: "ACTIVE",
    isDeleted: false,
  },
  {
    _id: "r2",
    name: "Munich Re",
    code: "R002",
    country: "Germany",
    rating: "AA",
    contactEmail: "contact@munichre.com",
    status: "ACTIVE",
    isDeleted: false,
  },
  {
    _id: "r3",
    name: "Hannover Re",
    code: "R003",
    country: "Germany",
    rating: "A",
    contactEmail: "contact@hannoverre.com",
    status: "INACTIVE",
    isDeleted: false,
  },
];

function statusChipProps(status) {
  switch (status) {
    case "ACTIVE":
      return { label: "ACTIVE", color: "success", variant: "outlined" };
    case "INACTIVE":
      return { label: "INACTIVE", color: "default", variant: "outlined" };
    default:
      return { label: status || "—", color: "default", variant: "outlined" };
  }
}

function ratingChipProps(rating) {
  switch (rating) {
    case "AAA":
      return { label: "AAA", color: "success", variant: "outlined" };
    case "AA":
      return { label: "AA", color: "primary", variant: "outlined" };
    case "A":
      return { label: "A", color: "warning", variant: "outlined" };
    case "BBB":
      return { label: "BBB", color: "default", variant: "outlined" };
    default:
      return { label: rating || "—", color: "default", variant: "outlined" };
  }
}

export default function ReinsurerList() {
  const [reinsurers, setReinsurers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [search, setSearch] = useState("");

  const { loggedInUser } = useAuth();

  const isCreateAllowed = isAllowed(loggedInUser?.user?.permissions, "CREATE");
  const isEditAllowed = isAllowed(loggedInUser?.user?.permissions, "UPDATE");
  const isDeleteAllowed = isAllowed(loggedInUser?.user?.permissions, "DELETE");

  // ✅ Dummy fetch
  const fetchReinsurers = async () => {
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 300));
      setReinsurers(DUMMY_REINSURERS);
    } catch {
      setError("Failed to fetch reinsurers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReinsurers();
  }, []);

  const onCreate = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const onEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const onDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  };

  // ✅ Soft delete
  const confirmDelete = () => {
    setReinsurers((prev) =>
      prev.map((r) =>
        r._id === itemToDelete._id ? { ...r, isDeleted: true } : r
      )
    );
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  const onModalClose = (reload = false) => {
    setShowModal(false);
    setSelectedItem(null);
    if (reload) fetchReinsurers();
  };

  // ✅ filter + search
  const visibleReinsurers = useMemo(() => {
    const q = search.toLowerCase();
    return reinsurers
      .filter((r) => !r.isDeleted)
      .filter((r) =>
        [r.name, r.code, r.country, r.contactEmail, r.rating, r.status]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
  }, [reinsurers, search]);

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {!!alertMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, py: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Reinsurers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage reinsurer profiles
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
            

              

              {isCreateAllowed && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onCreate}
                >
                  Create
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleReinsurers.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{r.code}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.country}</TableCell>

                  <TableCell>
                    <Chip size="small" {...ratingChipProps(r.rating)} />
                  </TableCell>

                  <TableCell>{r.contactEmail}</TableCell>

                  <TableCell>
                    <Chip size="small" {...statusChipProps(r.status)} />
                  </TableCell>

                 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal */}
      <ReinsurerForm
        onClose={onModalClose}
        showModal={showModal}
        reinsurerData={selectedItem}
      />

     
    </Box>
  );
}
