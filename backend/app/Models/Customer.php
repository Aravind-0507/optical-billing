<?php
// app/Models/Customer.php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = ['name', 'phone', 'email', 'address', 'dob'];

    public function invoices()      { return $this->hasMany(Invoice::class); }
    public function prescriptions() { return $this->hasMany(Prescription::class); }
}
