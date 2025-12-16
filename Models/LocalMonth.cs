namespace ButtonStatistics.Models
{
    public class LocalMonth
    {
        public int Index { get; set; } // 0 = Jan ... 11 = Dec (matches JS getMonth())
        public int Count { get; set; }
    }
}
