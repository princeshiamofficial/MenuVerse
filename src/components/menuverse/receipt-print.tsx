import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Download, Loader2 } from "lucide-react";
import { ReactBarcode, Renderer } from "react-jsbarcode";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadReceiptPDF } from "@/lib/receipt-pdf";

export interface ReceiptOrderLine {
  itemId: string;
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptOrderData {
  id: string;
  number: string;
  type: "dine_in" | "takeaway" | "delivery";
  tableNumber?: string | null;
  branchId?: string;
  customerName: string;
  phone: string;
  createdAt: string;
  lines: ReceiptOrderLine[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface BranchMeta {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface RestaurantMeta {
  name?: string;
  address?: string;
  phone?: string;
  logo?: string;
  branches?: BranchMeta[];
}

const TYPE_META: Record<ReceiptOrderData["type"], { label: string }> = {
  dine_in: { label: "Dine-In" },
  takeaway: { label: "Takeaway" },
  delivery: { label: "Delivery" },
};

const TAX_RATE = 0.05;

export function RealBarcode({ value }: { value: string }) {
  const cleanVal = value || "ORD-0000";
  return (
    <div className="barcode-wrapper flex flex-col items-center justify-center my-2 shrink-0 w-full">
      <ReactBarcode
        value={cleanVal}
        options={{
          format: "CODE128",
          width: 1.8,
          height: 38,
          displayValue: true,
          fontSize: 10,
          font: "monospace",
          margin: 4,
          background: "#FFFFFF",
          lineColor: "#000000",
        }}
        renderer={Renderer.SVG}
      />
    </div>
  );
}

import { getCurrencySymbol } from "@/lib/utils";

export function ThermalReceiptContent({
  order,
  restaurant,
  branches,
  currencySymbol,
}: {
  order: ReceiptOrderData;
  restaurant?: RestaurantMeta;
  branches?: BranchMeta[];
  currencySymbol?: string;
}) {
  const allBranches = branches || restaurant?.branches || [];
  const matchedBranch =
    allBranches.find(
      (b) => b.id === order.branchId || b.name.toLowerCase() === order.branchId?.toLowerCase(),
    ) ||
    allBranches.find((b) => b.isDefault) ||
    allBranches[0];

  const restaurantName = restaurant?.name || "Burger Craft Lab";
  const branchAddress =
    matchedBranch?.address || restaurant?.address || "221 Baker Street, Downtown, Gulshan-2, Dhaka";
  const branchPhone = matchedBranch?.phone || restaurant?.phone || "+880 1700-000000";
  const restaurantLogo = restaurant?.logo || "/default-logo.png";
  const cs = getCurrencySymbol(currencySymbol);

  return (
    <div
      id="printable-thermal-receipt"
      className="relative rounded-2xl border-2 border-dashed border-border bg-white dark:bg-card pt-3 px-6 pb-6 text-foreground font-mono text-xs shadow-md space-y-3 overflow-hidden"
    >
      {/* Decorative side notch cuts */}
      <div className="receipt-notch absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border border-border" />
      <div className="receipt-notch absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border border-border" />

      {/* Restaurant Header */}
      <div className="text-center space-y-1 flex flex-col items-center justify-center pt-0">
        {restaurantLogo ? (
          <div className="flex items-center justify-center w-full mb-0.5">
            <img
              src={restaurantLogo}
              alt={restaurantName}
              crossOrigin="anonymous"
              className="receipt-logo max-h-36 sm:max-h-40 max-w-[320px] w-auto object-contain mx-auto grayscale contrast-125 dark:brightness-110 mt-0 mb-1"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <h2 className="font-display text-2xl font-black tracking-wider uppercase text-foreground">
            {restaurantName}
          </h2>
        )}
        <p className="text-xs text-muted-foreground font-mono font-semibold leading-normal w-full text-center">
          {branchAddress}
        </p>
        <p className="text-xs text-muted-foreground font-mono font-semibold">Tel: {branchPhone}</p>
        <p className="text-xs text-muted-foreground font-mono font-medium pt-1">
          {new Date(order.createdAt).toLocaleString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
      </div>

      {/* Order Meta Strip */}
      <div className="border-t border-b border-dashed border-border/80 py-2.5 space-y-1">
        <div className="flex justify-between items-center font-bold">
          <span className="text-sm">ORDER #{order.number}</span>
          <span className="inline-block px-2 py-0.5 rounded bg-muted text-[10px] uppercase font-bold tracking-wide">
            {TYPE_META[order.type]?.label || order.type}
          </span>
        </div>
        {order.tableNumber && (
          <div className="text-[11px] font-semibold">Table: #{order.tableNumber}</div>
        )}
        <div className="flex justify-between text-[11px]">
          <span>Customer: {order.customerName}</span>
          <span>{order.phone}</span>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="space-y-1.5">
        <div className="flex justify-between font-bold text-[11px] uppercase border-b border-border pb-1 tracking-wider">
          <span>Item Description</span>
          <span>Total</span>
        </div>
        {order.lines.map((l) => (
          <div key={l.itemId} className="flex justify-between gap-2 text-[11px] py-0.5">
            <span className="truncate">
              {l.name} <span className="font-bold">× {l.qty}</span>
            </span>
            <span className="shrink-0 font-bold">
              {cs}
              {(l.qty * l.price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary Breakdown */}
      <div className="border-t border-dashed border-border/80 pt-2 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>
            {cs}
            {order.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({Math.round(TAX_RATE * 100)}%):</span>
          <span>
            {cs}
            {order.tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-black text-sm pt-2 border-t-2 border-foreground mt-1">
          <span>TOTAL PAID:</span>
          <span className="text-primary">
            {cs}
            {order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Footer Thank You */}
      <div className="text-center pt-3 space-y-1 border-t border-dashed border-border/60">
        <p className="text-[10px] font-sans font-semibold text-muted-foreground">
          *** Thank you for dining with us! ***
        </p>
        <p className="text-[9px] text-muted-foreground">Powered by MenuVerse OS</p>
      </div>
    </div>
  );
}

export function PrintReceiptDialog({
  order,
  restaurant,
  branches,
  currencySymbol,
  onClose,
}: {
  order: ReceiptOrderData | null;
  restaurant?: RestaurantMeta;
  branches?: BranchMeta[];
  currencySymbol?: string;
  onClose: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const printPageStyle = `
    @media print {
      body * {
        visibility: hidden !important;
      }
      #printable-thermal-receipt, #printable-thermal-receipt * {
        visibility: visible !important;
        color: #000000 !important;
        background: transparent !important;
        text-shadow: none !important;
      }
      #printable-thermal-receipt {
        position: fixed !important;
        left: 50% !important;
        top: 0 !important;
        transform: translateX(-50%) !important;
        width: 100% !important;
        max-width: 80mm !important;
        margin: 0 auto !important;
        padding: 8px 12px !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        font-family: monospace, 'Courier New', Courier, sans-serif !important;
        font-size: 11px !important;
        line-height: 1.35 !important;
      }
      #printable-thermal-receipt img.receipt-logo {
        max-height: 120px !important;
        max-width: 280px !important;
        object-fit: contain !important;
        filter: grayscale(100%) contrast(140%) !important;
        display: block !important;
        margin: 0 auto 10px auto !important;
      }
      .receipt-notch {
        display: none !important;
      }
      @page {
        size: 80mm auto;
        margin: 0mm;
      }
    }
  `;

  const handleReactToPrint = useReactToPrint({
    contentRef,
    documentTitle: order ? `Receipt-#${order.number}` : "Receipt",
    pageStyle: printPageStyle,
  });

  if (!order) return null;

  const handlePrint = () => {
    if (contentRef.current) {
      handleReactToPrint();
      return;
    }
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    try {
      await downloadReceiptPDF(contentRef.current, `Receipt-#${order.number}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <style>{printPageStyle}</style>
        <div ref={contentRef}>
          <ThermalReceiptContent
            order={order}
            restaurant={restaurant}
            branches={branches}
            currencySymbol={currencySymbol}
          />
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:gap-2 mt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="rounded-xl gap-1.5"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            className="gradient-warm text-primary-foreground shadow-elegant rounded-xl gap-1.5"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" /> Print Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
