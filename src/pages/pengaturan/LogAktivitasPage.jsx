import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/ui/layout/dashboard-layout";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/config/api";
import formatDate from "@/helper/formatDate";
import { makeToast } from "@/helper/makeToast";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import JSONPretty from "react-json-pretty";

const LogAktivitasPage = () => {
  const { filteredData, onClickItem, selected, isSelected, search, setSearch } =
    useLogAktivitas();
  return (
    <DashboardLayout title="Log Aksi">
      <div className="relative w-full md:w-fit min-w-[300px]">
        <Input
          className="w-full"
          placeholder="Cari log aktivitas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
      <div className="w-full flex flex-col justify-start md:justify-between md:flex-row gap-4">
        <div className="border-input rounded-md border bg-transparent p-4 text-base shadow-xs transition-[color,box-shadow] outline-none flex flex-col gap-4 overflow-auto w-full md:w-2/3">
          <h4 className="text-lg font-semibold">Daftar Log Aksi</h4>
          <div className="flex flex-col gap-2">
            {filteredData.map((item) => (
              <div
                key={item.log_aksi_id}
                className="flex flex-col gap-2 border-b border-gray-200 py-2"
              >
                <p className="text-sm">{item.deskripsi_aksi}</p>
                <div className="flex items-end justify-between">
                  <p className="text-sm text-gray-500">
                    {formatDate(item.created_at, true, true)}
                  </p>
                  <Button
                    variant={
                      isSelected(item.log_aksi_id) ? "default" : "secondary"
                    }
                    onClick={() => onClickItem(item)}
                  >
                    Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-input rounded-md border bg-transparent p-4 text-base shadow-xs transition-[color,box-shadow] outline-none flex flex-col gap-4 overflow-auto w-full md:w-1/3 sticky top-0 h-fit">
          <h4 className="text-lg font-semibold">Detail</h4>
          {selected ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Table className="text-sm">
                  <TableRow>
                    <TableCell className="font-medium">Pelaku</TableCell>
                    <TableCell className="text-right">
                      {selected?.user?.nama_pengguna}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Data</TableCell>
                    <TableCell className="text-right">
                      {selected?.model_referensi}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Aksi</TableCell>
                    <TableCell className="text-right">
                      {selected?.jenis_aksi === "Create"
                        ? "Tambah"
                        : selected?.jenis_aksi === "Delete"
                        ? "Hapus"
                        : "Ubah"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Waktu</TableCell>
                    <TableCell className="text-right">
                      {formatDate(selected?.created_at, true, true)}
                    </TableCell>
                  </TableRow>
                </Table>
              </div>
              <div className="flex flex-col gap-2 overflow-auto h-60">
                <h4 className="text-md font-semibold">Detail Aksi</h4>
                <Table className="text-sm">
                  {Object.entries(selected?.detail_aksi || {})
                    .filter(([key, value]) => {
                      // Skip jika key termasuk "_id", "created_at", atau "updated_at"
                      const excludedKeys = ["_id", "created_at", "updated_at"];
                      if (excludedKeys.some((exclude) => key.includes(exclude)))
                        return false;

                      // Skip jika value adalah object
                      if (typeof value === "object" && value !== null)
                        return false;

                      return true;
                    })
                    .map(([key, value]) => {
                      // Kapitalisasi huruf pertama
                      const keyName = key.replace("_", " ");
                      const capitalizedKey =
                        keyName.charAt(0).toUpperCase() + keyName.slice(1);

                      return (
                        <TableRow key={key}>
                          <TableCell className="font-medium">
                            {capitalizedKey}
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="max-w-sm whitespace-pre-wrap break-words">
                              {value}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </Table>

                {/* <JSONPretty data={selected?.detail_aksi} /> */}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center mb-8">
              Tidak ada detail terpilih
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const useLogAktivitas = () => {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filteredData = data.filter(
    (item) =>
      item.deskripsi_aksi.toLowerCase().includes(search.toLowerCase()) ||
      item.model_referensi.toLowerCase().includes(search.toLowerCase()) ||
      item.user?.nama_pengguna.toLowerCase().includes(search.toLowerCase()) ||
      item.jenis_aksi.toLowerCase().includes(search.toLowerCase())
  );

  const fetchLogs = async () => {
    try {
      const res = await api.get("/log-aksi", {
        params: {
          semua: "true",
        },
      });
      setData(res.data.data);
    } catch (error) {
      makeToast("error", error);
    }
  };

  const onClickItem = (item) => {
    if (isSelected(item?.log_aksi_id)) {
      setSelected(null);
    } else {
      setSelected(item);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const isSelected = (id) => selected?.log_aksi_id === id;

  return {
    filteredData,
    onClickItem,
    selected,
    isSelected,
    setSearch,
    search,
  };
};

export default LogAktivitasPage;
