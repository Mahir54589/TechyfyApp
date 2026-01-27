"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-xl text-slate-800 dark:text-slate-200">
            📄 Invoice Generator Dashboard
          </h1>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          TechyfyApp
        </div>
      </header>
      <main className="p-8 flex flex-col gap-8 max-w-6xl mx-auto">
        <Dashboard />
      </main>
    </>
  );
}

function Dashboard() {
  const invoices = useQuery(api.invoices.list, { limit: 10 });
  const products = useQuery(api.products.list);
  const syncStatus = useQuery(api.googleSheets.getSyncStatus);
  const syncProducts = useAction(api.googleSheets.syncFromGoogleSheets);
  const initializeDefaults = useMutation(api.config.initializeDefaults);
  
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    productsAdded?: number;
    productsUpdated?: number;
  } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncProducts();
      setSyncResult(result);
    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : "Sync failed",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await initializeDefaults();
      alert("System initialized successfully!");
    } catch (error) {
      alert("Failed to initialize: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Products"
          value={products?.length || 0}
          icon="📦"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Invoices"
          value={invoices?.length || 0}
          icon="🧾"
          color="bg-green-500"
        />
        <StatCard
          title="Last Sync"
          value={syncStatus?.lastSync ? new Date(syncStatus.lastSync).toLocaleDateString() : "Never"}
          icon="🔄"
          color="bg-purple-500"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {syncing ? (
            <>
              <span className="animate-spin">🔄</span> Syncing...
            </>
          ) : (
            <>
              🔄 Sync with Google Sheets
            </>
          )}
        </button>
        
        <button
          onClick={handleInitialize}
          className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          ⚙️ Initialize System
        </button>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div
          className={`p-4 rounded-lg ${
            syncResult.success
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          <p className="font-medium">{syncResult.message}</p>
          {syncResult.productsAdded !== undefined && (
            <p className="text-sm mt-1">
              Added: {syncResult.productsAdded} | Updated: {syncResult.productsUpdated}
            </p>
          )}
        </div>
      )}

      {/* Recent Invoices */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Recent Invoices
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                  Invoice #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {!invoices ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No invoices yet. Use the Telegram bot to create your first invoice!
                  </td>
                </tr>
              ) : (
                invoices.map((invoice: {
                  _id: string;
                  invoiceNumber: string;
                  customerName: string;
                  date: number;
                  total: number;
                  items: Array<unknown>;
                }) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {invoice.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-800 dark:text-slate-200">
                      ৳{invoice.total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600 dark:text-slate-400">
                      {invoice.items.length}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Products ({products?.length || 0})
          </h2>
        </div>
        <div className="p-4">
          {!products ? (
            <p className="text-slate-500 text-center py-4">Loading...</p>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">No products in database.</p>
              <p className="text-sm text-slate-400">
                Click &quot;Sync with Google Sheets&quot; to import products, or use the
                Initialize button to add sample data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product: {
                _id: string;
                name: string;
                color: string;
                warranty: string;
                sellingPrice: number;
                category: string;
              }) => (
                <div
                  key={product._id}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {product.color} • {product.warranty}
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-2">
                    ৳{product.sellingPrice.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-400">{product.category}</p>
                </div>
              ))}
              {products.length > 6 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">
                    +{products.length - 6} more products
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
          📱 Telegram Bot Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
          <li>Open Telegram and search for your bot</li>
          <li>Send <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">/start</code> to begin</li>
          <li>Enter customer info: <em>Name, Address, Phone</em></li>
          <li>Enter product names (comma-separated)</li>
          <li>Confirm quantities and prices</li>
          <li>Receive PDF invoice!</li>
        </ol>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-4">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}
