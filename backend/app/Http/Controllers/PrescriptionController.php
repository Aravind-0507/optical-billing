<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prescription;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $q = Prescription::with('customer');
        if ($request->customer_id) {
            $q->where('customer_id', $request->customer_id);
        }
        $prescriptions = $q->orderBy('visit_date', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $prescriptions]);
    }

    public function store(Request $request)
    {
        $request->validate(['customer_id' => 'required|exists:customers,id']);
        $p = Prescription::create([
            'customer_id' => $request->customer_id,
            're_sph' => $request->re_sph, 're_cyl' => $request->re_cyl,
            're_axis' => $request->re_axis, 're_add' => $request->re_add,
            'le_sph' => $request->le_sph, 'le_cyl' => $request->le_cyl,
            'le_axis' => $request->le_axis, 'le_add' => $request->le_add,
            'visit_date' => $request->visit_date ?? now()->toDateString(),
            'notes' => $request->notes,
        ]);
        return response()->json(['status' => 'success', 'data' => $p], 201);
    }

    public function destroy($id)
    {
        Prescription::findOrFail($id)->delete();
        return response()->json(['status' => 'success', 'message' => 'Deleted']);
    }
}