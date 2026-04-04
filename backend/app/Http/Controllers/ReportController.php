<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf; 

class ReportController extends Controller
{
    public function daily(Request $request)
    {
        $from = $request->from_date ?? now()->toDateString();
        $to   = $request->to_date   ?? now()->toDateString();

        $invoices = Invoice::with('customer')
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'total_bills'   => $invoices->count(),
            'total_revenue' => round($invoices->sum('total'), 2),
            'cash'          => round($invoices->where('payment_mode', 'cash')->sum('total'), 2),
            'upi'           => round($invoices->where('payment_mode', 'upi')->sum('total'), 2),
            'card'          => round($invoices->where('payment_mode', 'card')->sum('total'), 2),
        ];

        return response()->json([
            'status'   => 'success',
            'from'     => $from,
            'to'       => $to,
            'summary'  => $summary,
            'invoices' => $invoices,
        ]);
    }

    public function monthly(Request $request)
    {
        $year = $request->year ?? now()->year;

        $data = Invoice::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as bills'),
            DB::raw('SUM(total) as revenue')
        )
        ->whereYear('created_at', $year)
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        return response()->json(['status' => 'success', 'year' => $year, 'data' => $data]);
    }

    public function topProducts(Request $request)
    {
        $from = $request->from_date ?? now()->startOfMonth()->toDateString();
        $to   = $request->to_date   ?? now()->toDateString();

        $products = InvoiceItem::select(
            'product_id',
            'name',
            DB::raw('SUM(qty) as total_qty'),
            DB::raw('SUM(total) as total_revenue')
        )
        ->whereHas('invoice', function ($q) use ($from, $to) {
            $q->whereDate('created_at', '>=', $from)->whereDate('created_at', '<=', $to);
        })
        ->groupBy('product_id', 'name')
        ->orderByDesc('total_qty')
        ->limit(10)
        ->get();

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function exportPdf(Request $request)
    {
        $from = $request->from_date ?? now()->toDateString();
        $to   = $request->to_date   ?? now()->toDateString();

        $invoices = Invoice::with('customer')
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->orderBy('created_at', 'desc')
            ->get();

        $settings = Setting::pluck('value', 'key');
        $summary  = [
            'total_bills'   => $invoices->count(),
            'total_revenue' => round($invoices->sum('total'), 2),
            'cash'          => round($invoices->where('payment_mode', 'cash')->sum('total'), 2),
            'upi'           => round($invoices->where('payment_mode', 'upi')->sum('total'), 2),
            'card'          => round($invoices->where('payment_mode', 'card')->sum('total'), 2),
        ];

        $pdf = Pdf::loadView('reports.daily', compact('invoices', 'settings', 'summary', 'from', 'to'));
        return $pdf->download("report-{$from}-to-{$to}.pdf");
    }
}