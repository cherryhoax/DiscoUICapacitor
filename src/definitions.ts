export interface DiscoUIPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
