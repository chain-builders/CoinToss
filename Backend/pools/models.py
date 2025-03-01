from django.db import models

# Create your models here.
class Pool(models.Model):
  id = models.CharField(max_length=255)
  stake = models.IntegerField(null=False)
  num_players = models.IntegerField(null=False)
  is_private = models.BooleanField(null=False)
  is_active = models.BooleanField(null=False)
  date_created = models.DateTimeField(null=False, auto_now_add=True)

  def __str__(self):
    return self.id


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