import threading
from .blockchain import Blockchain

def recurrent_request(blockchain_instance):
    blockchain_instance.check_logs()
    threading.Timer(5, recurrent_request, [blockchain_instance]).start()

def start_http_scheduler():
    blockchain_instance = Blockchain()
    blockchain_instance.initialize_web3_connections()
    recurrent_request(blockchain_instance)