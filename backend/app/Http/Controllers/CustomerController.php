<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $q = Customer::query();
        if ($request->search) {
            $s = $request->search;
            $q->where(function($query) use ($s) {
                $query->where('name', 'like', "%$s%")
                      ->orWhere('phone', 'like', "%$s%");
            });
        }
        $customers = $q->orderBy('created_at', 'desc')->paginate(20);
        return response()->json(['status' => 'success', 'data' => $customers]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:100',
            'phone' => 'required|string|max:15',
        ]);

        $customer = Customer::create([
            'name'    => $request->name,
            'phone'   => $request->phone,
            'email'   => $request->email,
            'address' => $request->address,
            'dob'     => $request->dob,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Customer added', 'data' => $customer], 201);
    }

    public function show($id)
    {
        $customer = Customer::with([
            'invoices' => fn($q) => $q->orderBy('created_at', 'desc'),
            'invoices.items.product',
            'prescriptions' => fn($q) => $q->orderBy('visit_date', 'desc'),
        ])->findOrFail($id);

        return response()->json(['status' => 'success', 'data' => $customer]);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $request->validate([
            'name'  => 'required|string|max:100',
            'phone' => 'required|string|max:15',
        ]);

        $customer->update([
            'name'    => $request->name,
            'phone'   => $request->phone,
            'email'   => $request->email,
            'address' => $request->address,
            'dob'     => $request->dob,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Customer updated', 'data' => $customer]);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();
        return response()->json(['status' => 'success', 'message' => 'Customer deleted']);
    }

    public function history($id)
    {
        $customer = Customer::with([
            'invoices.items.product',
            'prescriptions',
        ])->findOrFail($id);

        return response()->json(['status' => 'success', 'data' => $customer]);
    }
}