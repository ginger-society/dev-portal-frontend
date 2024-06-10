export enum ColumnType {
  String = 'CharField',
  Boolean = 'BooleanField',
  DateField = 'DateField',
  DateTimeField = 'DateTimeField',
  ForeignKey = 'ForeignKey',
  PK = 'BigAutoField',
  PositiveIntegerField = 'PositiveIntegerField',
  FloatField = 'FloatField',
  ManyToManyField = 'ManyToManyField',
  TextField = 'TextField',
  OneToOneField = 'OneToOneField'
}


export enum OnDeleteOptions {
  CASCADE = 'CASCADE',
  PROTECT = 'PROTECT',
  SET_NULL = 'SET_NULL',
  DO_NOTHING = 'DO_NOTHING'
}