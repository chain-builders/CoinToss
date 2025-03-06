from .transaction import TransactionManager
from .socket import SocketManager

async def start_event_listener():
    transactionManager = TransactionManager()
    socketManager = SocketManager()
    transactionManager.initialize_web3_connections()
    await socketManager.connect_socket(transactionManager)

    