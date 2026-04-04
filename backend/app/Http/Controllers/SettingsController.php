<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Setting;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key');
        return response()->json(['status' => 'success', 'data' => $settings]);
    }

    public function update(Request $request)
    {
        $fields = [
            'shop_name', 'phone', 'address', 'city',
            'gst_no', 'email', 'footer_msg', 'gst_rate',
        ];

        foreach ($fields as $field) {
            if ($request->has($field)) {
                Setting::updateOrCreate(
                    ['key' => $field],
                    ['value' => $request->$field]
                );
            }
        }

        return response()->json(['status' => 'success', 'message' => 'Settings saved']);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate(['logo' => 'required|image|max:2048']);

        // Delete old logo
        $old = Setting::where('key', 'logo_path')->first();
        if ($old && $old->value) {
            Storage::disk('public')->delete($old->value);
        }

        $path = $request->file('logo')->store('logos', 'public');

        Setting::updateOrCreate(
            ['key' => 'logo_path'],
            ['value' => $path]
        );

        return response()->json([
            'status'   => 'success',
            'message'  => 'Logo uploaded',
            'logo_url' => asset('storage/' . $path),
        ]);
    }
}