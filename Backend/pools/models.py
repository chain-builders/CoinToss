from django.db import models


class Pool(models.Model):
  pool_id = models.PositiveIntegerField(unique=True)
  tx_hash = models.CharField(max_length=66) 
  entry_fee = models.BigIntegerField(help_text="Entry fee in wei")
  max_participants = models.PositiveIntegerField()
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return self.id

  class Meta:
        ordering = ['-created_at']


class Player(models.Model):
  address = models.CharField(max_length=255)
  date_joined = models.DateTimeField(null=False, auto_now_add=True)

  def __str__(self):
    return self.address

class PoolPlayer(models.Model):
  pool = models.ForeignKey(Pool, on_delete=models.CASCADE)
  player = models.ForeignKey(Player, on_delete=models.CASCADE)
  date_joined = models.DateTimeField(null=False, auto_now_add=True)

  def __str__(self):
    return self.pool.id + ' - ' + self.player.address