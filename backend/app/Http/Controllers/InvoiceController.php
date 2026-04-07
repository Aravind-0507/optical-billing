<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\Prescription;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $q = Invoice::with('customer');

        if ($request->search) {
            $s = $request->search;
            $q->where('bill_no', 'like', "%$s%")
              ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%$s%"));
        }
        if ($request->from_date) $q->whereDate('created_at', '>=', $request->from_date);
        if ($request->to_date)   $q->whereDate('created_at', '<=', $request->to_date);
        if ($request->payment_mode) $q->where('payment_mode', $request->payment_mode);

        $invoices = $q->orderBy('created_at', 'desc')->paginate(20);
        return response()->json(['status' => 'success', 'data' => $invoices]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id'        => 'required|exists:customers,id',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.price'      => 'required|numeric|min:0',
            'payment_mode'       => 'required|in:cash,upi,card',
        ]);

        $invoice = DB::transaction(function () use ($request) {

            // Generate bill number
            $last = Invoice::orderBy('id', 'desc')->first();
            $num  = $last ? (intval(substr($last->bill_no, 4)) + 1) : 1;
            $bill_no = 'OPT-' . str_pad($num, 4, '0', STR_PAD_LEFT);
        
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['price'] * $item['qty'];
            }
        
            $invoice = Invoice::create([
                'customer_id' => $request->customer_id,
                'bill_no'     => $bill_no,
                'subtotal'    => $subtotal,
                'total'       => $subtotal,
                'payment_mode'=> $request->payment_mode,
            ]);
        
            foreach ($request->items as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'name'       => $item['name'],
                    'qty'        => $item['qty'],
                    'price'      => $item['price'],
                    'total'      => $item['price'] * $item['qty'],
                ]);
        
                Product::where('id', $item['product_id'])
                    ->decrement('stock', $item['qty']);
            }
        
            // 🔥 IMPORTANT RETURN
            return $invoice;
        });

        $invoice->load('customer', 'items.product');

        return response()->json([
            'status'  => 'success',
            'message' => 'Bill created successfully',
            'data'    => $invoice,
        ], 201);
    }

    public function show($id)
    {
        $invoice = Invoice::with(['customer', 'items.product', 'prescription'])->findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $invoice]);
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        // Restore stock
        foreach ($invoice->items as $item) {
            Product::where('id', $item->product_id)->increment('stock', $item->qty);
        }
        $invoice->delete();
        return response()->json(['status' => 'success', 'message' => 'Bill deleted']);
    }
}