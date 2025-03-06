from .transaction import TransactionManager
#from .socket import SocketManager

def start_event_listener():
    transactionManager = TransactionManager()
    #socketManager = SocketManager()
    transactionManager.initialize_web3_connections()
    #await socketManager.connect_socket(transactionManager)
    transactionManager.create_pool(5, 1)
    transactionManager.join_pool(1)
    transactionManager.get_logs('PoolActivated')

    