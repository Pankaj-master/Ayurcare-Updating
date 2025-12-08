import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { CheckCircle, XCircle, Search, User } from "lucide-react";
import { superAdminAPI } from "../services/api";
import { toast } from "sonner";

export function DoctorVerificationPage() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const statusColors = {
    VERIFIED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  // Normalize verification value
  const normalizeStatus = (value) => {
    if (!value) return "PENDING";
    return value;
  };

  // -------------------------------------------
  // FETCH DOCTORS
  // -------------------------------------------
  const loadDoctors = async () => {
    try {
      const res = await superAdminAPI.getAllDoctors();
      const list = res.data.data.map((doc) => ({
        ...doc,
        is_verified: normalizeStatus(doc.is_verified),
      }));

      setDoctors(list);
      setFiltered(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doctors");
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // -------------------------------------------
  // FILTERING
  // -------------------------------------------
  const filterByStatus = (status) => {
    if (status === "ALL") {
      setFiltered(doctors);
      return;
    }

    setFiltered(
      doctors.filter((d) => normalizeStatus(d.is_verified) === status)
    );
  };

  // Search
  useEffect(() => {
    const f = doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(f);
  }, [searchTerm]);

  // -------------------------------------------
  // APPROVE DOCTOR
  // -------------------------------------------
  const handleApprove = async (id) => {
    try {
      await superAdminAPI.approveDoctor(id);

      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_verified: "VERIFIED" } : d))
      );

      toast.success("Doctor verified successfully");
      filterByStatus("ALL");
    } catch (err) {
      console.error(err);
      toast.error("Approve failed");
    }
  };

  // -------------------------------------------
  // REJECT DOCTOR
  // -------------------------------------------
  const openRejectModal = (doctor) => {
    setSelectedDoctor(doctor);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      await superAdminAPI.rejectDoctor(selectedDoctor.id, rejectReason);

      setDoctors((prev) =>
        prev.map((d) =>
          d.id === selectedDoctor.id ? { ...d, is_verified: "REJECTED" } : d
        )
      );

      toast.success("Doctor rejected");
      setRejectModalOpen(false);
      filterByStatus("ALL");
    } catch (err) {
      console.error(err);
      toast.error("Reject failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">Doctor Verification</h1>
        <p className="text-muted-foreground">Approve or reject doctors.</p>
      </div>

      {/* SEARCH BAR */}
      <Card>
        <CardContent className="p-6 flex items-center space-x-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* FILTER TABS */}
      <Tabs defaultValue="ALL" onValueChange={filterByStatus}>
        <TabsList className="mb-4">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors ({filtered.length})</CardTitle>
          <CardDescription>Manage verification status</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>

                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{doc.email}</TableCell>
                  <TableCell>{doc.phone || "N/A"}</TableCell>
                  <TableCell>{doc.specialization || "N/A"}</TableCell>
                  <TableCell>{doc.licenseNumber}</TableCell>
                  <TableCell>{doc.experience} yrs</TableCell>

                  <TableCell>
                    <Badge
                      className={`${statusColors[doc.is_verified]} border-0`}
                    >
                      {doc.is_verified}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex space-x-2">
                      {doc.is_verified === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(doc.id)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Verify
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectModal(doc)}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}

                      {doc.is_verified === "VERIFIED" && (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          Approved
                        </Badge>
                      )}

                      {doc.is_verified === "REJECTED" && (
                        <Badge className="bg-red-100 text-red-700 border-0">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* REJECTION MODAL */}
      <Dialog
        open={rejectModalOpen}
        onOpenChange={(open) => {
          if (!open) setRejectModalOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Doctor</DialogTitle>
          </DialogHeader>

          <Label>Reason for rejection</Label>
          <Input
            placeholder="Enter reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
