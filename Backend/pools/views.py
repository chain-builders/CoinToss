from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from .Connector import BlockchainConnector
from .models import Pool


@api_view(['POST'])
@permission_classes([IsAdminUser])  
def create_pool(request):
    entry_fee = int(request.data.get('entry_fee')) 
    max_participants = int(request.data.get('max_participants'))
    
    if entry_fee <= 0:
        return Response({"error": "Entry fee must be greater than zero"}, status=400)
    
    blockchain = BlockchainConnector()
    
    try:
        result = blockchain.create_pool(entry_fee, max_participants)
        
        if result['status'] == 'success':
           
            Pool.objects.create(
                pool_id=result['pool_id'],
                entry_fee=entry_fee,
                max_participants=max_participants,
                tx_hash=result['tx_hash'],
                status='OPENED'
            )
            
            return Response({
                "message": "Pool created successfully",
                "tx_hash": result['tx_hash'],
                "pool_id": result['pool_id']
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "error": "Transaction failed",
                "tx_hash": result['tx_hash']
            }, status=400)
            
    except Exception as e:
        return Response({"error": str(e)}, status=500)
        
