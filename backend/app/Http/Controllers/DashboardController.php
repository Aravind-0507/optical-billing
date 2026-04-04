<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Product;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        // Today stats
        $todayRevenue = Invoice::whereDate('created_at', $today)->sum('total');
        $todayBills   = Invoice::whereDate('created_at', $today)->count();

        // Total stats
        $totalCustomers = Customer::count();
        $totalProducts  = Product::count();
        $lowStock       = Product::where('stock', '<=', 5)->where('stock', '>', 0)->count();
        $outOfStock     = Product::where('stock', 0)->count();

        // Monthly revenue
        $monthRevenue = Invoice::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');

        // Last 7 days revenue for chart
        $weekData = Invoice::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total) as revenue'),
            DB::raw('COUNT(*) as bills')
        )
        ->where('created_at', '>=', now()->subDays(6)->startOfDay())
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Payment mode split (this month)
        $paymentSplit = Invoice::select('payment_mode', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
            ->whereMonth('created_at', now()->month)
            ->groupBy('payment_mode')
            ->get();

        // Recent 5 bills
        $recentBills = Invoice::with('customer')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'today_revenue'   => round($todayRevenue, 2),
                'today_bills'     => $todayBills,
                'month_revenue'   => round($monthRevenue, 2),
                'total_customers' => $totalCustomers,
                'total_products'  => $totalProducts,
                'low_stock'       => $lowStock,
                'out_of_stock'    => $outOfStock,
                'week_chart'      => $weekData,
                'payment_split'   => $paymentSplit,
                'recent_bills'    => $recentBills,
            ],
        ]);
    }
}