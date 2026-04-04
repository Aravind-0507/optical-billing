<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = Product::query();
        if ($request->search) {
            $q->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->category) {
            $q->where('category', $request->category);
        }
        $products = $q->orderBy('name')->get();
        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:150',
            'category' => 'required|string',
            'price'    => 'required|numeric|min:0',
            'stock'    => 'required|integer|min:0',
        ]);

        $product = Product::create([
            'name'        => $request->name,
            'category'    => $request->category,
            'brand'       => $request->brand,
            'price'       => $request->price,
            'cost_price'  => $request->cost_price ?? 0,
            'stock'       => $request->stock,
            'description' => $request->description,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Product added', 'data' => $product], 201);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $product]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $request->validate([
            'name'     => 'required|string|max:150',
            'category' => 'required|string',
            'price'    => 'required|numeric|min:0',
            'stock'    => 'required|integer|min:0',
        ]);

        $product->update([
            'name'        => $request->name,
            'category'    => $request->category,
            'brand'       => $request->brand,
            'price'       => $request->price,
            'cost_price'  => $request->cost_price ?? 0,
            'stock'       => $request->stock,
            'description' => $request->description,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Product updated', 'data' => $product]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['status' => 'success', 'message' => 'Product deleted']);
    }

    public function categories()
    {
        return response()->json([
            'status' => 'success',
            'data'   => ['Frames', 'Lenses', 'Contact Lens', 'Sunglasses', 'Accessories', 'Services'],
        ]);
    }
}