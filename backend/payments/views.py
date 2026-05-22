import hmac
import hashlib
import json
import razorpay

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import PaymentOrder

# Plan → amount in paise (INR × 100)
PLAN_PRICES = {
    'standard_monthly': 99900,   # ₹999
    'elite_quarterly':  249900,  # ₹2499
    'premium_annual':   699900,  # ₹6999
}

def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """
    Body: { plan, name, email }
    Returns: { order_id, amount, currency, key_id, is_mock }
    """
    plan  = request.data.get('plan', 'standard_monthly')
    name  = request.data.get('name', '')
    email = request.data.get('email', '')

    amount = PLAN_PRICES.get(plan)
    if amount is None:
        return Response({'error': 'Invalid plan.'}, status=status.HTTP_400_BAD_REQUEST)

    # Detect if we should use mock order (default sandbox credentials or missing credentials)
    use_mock = (
        settings.RAZORPAY_KEY_ID == 'rzp_test_yourkeyid' or
        settings.RAZORPAY_KEY_SECRET == 'yourtestkeysecret' or
        not settings.RAZORPAY_KEY_ID or
        not settings.RAZORPAY_KEY_SECRET
    )

    rp_order = None
    if not use_mock:
        try:
            client = get_razorpay_client()
            order_data = {
                'amount':   amount,
                'currency': 'INR',
                'receipt':  f'rcpt_{plan[:8]}',
                'notes': {'plan': plan, 'customer_name': name, 'customer_email': email},
            }
            rp_order = client.order.create(data=order_data)
        except Exception as e:
            # If razorpay client call fails, fallback to mock if in DEBUG mode
            if settings.DEBUG:
                print(f"Razorpay order creation failed: {e}. Falling back to Mock Order.")
                use_mock = True
            else:
                return Response({'error': f'Razorpay initiation failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if use_mock:
        import uuid
        mock_id = f"order_mock_{uuid.uuid4().hex[:12]}"
        rp_order = {
            'id': mock_id,
            'amount': amount,
            'currency': 'INR',
        }

    PaymentOrder.objects.create(
        razorpay_order_id=rp_order['id'],
        plan=plan,
        amount_paise=amount,
        email=email,
        name=name,
    )

    return Response({
        'order_id': rp_order['id'],
        'amount':   amount,
        'currency': 'INR',
        'key_id':   settings.RAZORPAY_KEY_ID,
        'is_mock':  use_mock,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_payment(request):
    """
    Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    Returns: { success: true } or 400
    """
    oid = request.data.get('razorpay_order_id', '')
    pid = request.data.get('razorpay_payment_id', '')
    sig = request.data.get('razorpay_signature', '')

    # Check if this is a mock order
    is_mock_order = oid.startswith("order_mock_")
    use_mock = (
        is_mock_order or
        settings.RAZORPAY_KEY_ID == 'rzp_test_yourkeyid' or
        settings.RAZORPAY_KEY_SECRET == 'yourtestkeysecret' or
        not settings.RAZORPAY_KEY_ID or
        not settings.RAZORPAY_KEY_SECRET
    )

    if not use_mock:
        # HMAC-SHA256 verification
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{oid}|{pid}".encode(),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected, sig):
            return Response({'error': 'Payment verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # For mock verification, if signature or payment ID isn't provided, auto-generate
        if not pid:
            import uuid
            pid = f"pay_mock_{uuid.uuid4().hex[:12]}"
        if not sig:
            sig = f"sig_mock_{uuid.uuid4().hex[:24]}"

    try:
        order = PaymentOrder.objects.get(razorpay_order_id=oid)
        order.razorpay_payment_id = pid
        order.razorpay_signature  = sig
        order.status = 'paid'
        order.save()
    except PaymentOrder.DoesNotExist:
        # If order wasn't saved yet, let's create a stub
        PaymentOrder.objects.create(
            razorpay_order_id=oid,
            razorpay_payment_id=pid,
            razorpay_signature=sig,
            plan='standard_monthly',
            amount_paise=99900,
            status='paid'
        )

    return Response({'success': True, 'payment_id': pid})


@api_view(['GET'])
@permission_classes([AllowAny])
def plan_prices(request):
    """Public endpoint: returns plan → price info."""
    return Response({
        k: {'amount_paise': v, 'amount_inr': v // 100}
        for k, v in PLAN_PRICES.items()
    })
