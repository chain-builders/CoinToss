from .transaction import TransactionManager
from .socket import SocketManager

def start_event_listener():
    transactionManager = TransactionManager()
    socketManager = SocketManager()
    transactionManager.initialize_web3_connections()
    socketManager.connect_socket(transactionManager)

    